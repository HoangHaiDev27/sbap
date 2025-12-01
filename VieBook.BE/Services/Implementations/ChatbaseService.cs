using BusinessObject.Chatbase;
using BusinessObject.Models;
using BusinessObject.OpenAI;
using Microsoft.Extensions.Options;
using Repositories.Interfaces;
using Service.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Service.Implementations
{
public class ChatbaseService : IChatbaseService
{
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;
    private readonly ISubscriptionRepository _subscriptionRepository; 
    private readonly HttpClient _httpClient;
    private readonly OpenAIConfig _settings;
    private readonly IChatbaseRepository _chatbaseRepository;

    public ChatbaseService(IBookRepository bookRepository,IUserRepository userRepository,ISubscriptionRepository subscriptionRepository, HttpClient httpClient,IOptions<OpenAIConfig> settings,IChatbaseRepository chatbaseRepository)
    {
        _bookRepository = bookRepository;
        _userRepository = userRepository;
        _subscriptionRepository = subscriptionRepository;
        _httpClient = httpClient;
        _settings = settings.Value;
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
        _chatbaseRepository = chatbaseRepository;
    }

   public async Task<string> GetChatResponseAsync(string question, string frontendUrl, int? userId = null)
{
    // --- 1️⃣ Lưu tin nhắn người dùng ---
    await _chatbaseRepository.AddMessageAsync(userId, question, "user");

    // --- 2️⃣ Lấy danh sách sách ---
    var books = await _bookRepository.GetAllInforAsync();

    if (!books.Any())
    {
        var emptyResponse = "Hiện tại không có sách nào trong hệ thống.";
        await _chatbaseRepository.AddMessageAsync(userId, emptyResponse, "bot");
        return emptyResponse;
    }

    // --- 3️⃣ Chuẩn hóa câu hỏi ---
    string normalizedQuestion = question.ToLower();

    List<Book> filteredBooks;

    // --- 4️⃣ Nếu hỏi về khuyến mãi ---
    if (normalizedQuestion.Contains("khuyến mãi") || normalizedQuestion.Contains("giảm giá"))
    {
        var nowVN = DateTime.UtcNow.AddHours(7); // Giờ VN
        filteredBooks = books
            .Where(b => (b.Promotions ?? Enumerable.Empty<Promotion>())
                .Any(p => p.IsActive && p.StartAt <= nowVN && p.EndAt >= nowVN && p.DiscountValue > 0))
            .ToList();

        if (!filteredBooks.Any())
        {
            var noPromotion = "Hiện tại không có sách nào đang có khuyến mãi. Tất cả các sách đều không có chương trình giảm giá.";
            await _chatbaseRepository.AddMessageAsync(userId, noPromotion, "bot");
            return noPromotion;
        }
    }
    else
    {
        // --- 4a️⃣ Kiểm tra tác giả ---
        bool isAuthorQuery = normalizedQuestion.Contains("sách của") || normalizedQuestion.Contains("tác phẩm của");
        if (isAuthorQuery)
        {
            string authorQuery = normalizedQuestion.Contains("sách của")
                ? normalizedQuestion.Split("sách của")[1].Trim()
                : normalizedQuestion.Split("tác phẩm của")[1].Trim();

            filteredBooks = books
                .Where(b => !string.IsNullOrEmpty(b.Author) && b.Author.ToLower().Contains(authorQuery))
                .ToList();

            if (!filteredBooks.Any())
            {
                var noAuthorBooks = "Chưa có tác phẩm nào của tác giả này.";
                await _chatbaseRepository.AddMessageAsync(userId, noAuthorBooks, "bot");
                return noAuthorBooks;
            }
        }
        else
        {
            // --- 4b️⃣ Lọc theo thể loại hoặc tên sách ---
            var keywords = normalizedQuestion.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();

            var categoryLookup = books
                .SelectMany(b => b.Categories)
                .Select(c => c.Name.ToLower())
                .Distinct()
                .ToList();

            var matchedCategories = categoryLookup
                .Where(cat => keywords.Any(k => cat.Contains(k)))
                .ToList();

            if (matchedCategories.Any())
            {
                filteredBooks = books
                    .Where(b => b.Status == "Approved" &&
                                b.Categories.Any(c => matchedCategories.Contains(c.Name.ToLower())))
                    .ToList();

                if (!filteredBooks.Any())
                {
                    var noCategoryBooks = "Hiện chưa có sách trong thể loại này.";
                    await _chatbaseRepository.AddMessageAsync(userId, noCategoryBooks, "bot");
                    return noCategoryBooks;
                }
            }
            else
            {
                filteredBooks = books
                    .Where(b => b.Status == "Approved" &&
                                (normalizedQuestion.Contains(b.Title.ToLower()) ||
                                 (!string.IsNullOrEmpty(b.Author) && normalizedQuestion.Contains(b.Author.ToLower()))))
                    .ToList();

                if (!filteredBooks.Any())
                {
                    var noMatchBooks = "Không tìm thấy sách phù hợp với yêu cầu.";
                    await _chatbaseRepository.AddMessageAsync(userId, noMatchBooks, "bot");
                    return noMatchBooks;
                }
            }
        }
    }

    // --- 5️⃣ Tạo context chi tiết sách ---
    string context = string.Join("\n\n", filteredBooks.Select(b =>
    {
        var activeChapters = b.Chapters.Where(c => c.Status == "Active").ToList();
        var readChapters = activeChapters.Where(c => !string.IsNullOrEmpty(c.ChapterSoftUrl)).ToList();
        var audioChapters = activeChapters.Where(c => c.ChapterAudios != null &&
                                                     c.ChapterAudios.Any(a => !string.IsNullOrEmpty(a.AudioLink)))
                                         .ToList();

        var totalSoftPrice = readChapters.Sum(c => c.PriceSoft ?? 0);
        var totalAudioPrice = audioChapters.Sum(c =>
            c.ChapterAudios.FirstOrDefault(a => !string.IsNullOrEmpty(a.AudioLink))?.PriceAudio ?? 0);

        string type = (readChapters.Any(), audioChapters.Any()) switch
        {
            (true, true) => "Sách đọc và sách nói",
            (true, false) => "Sách đọc",
            (false, true) => "Sách nói",
            _ => "Không xác định"
        };

        // --- Lấy promotion đúng giờ VN ---
        var nowVN = DateTime.UtcNow.AddHours(7); // Giờ VN
        var promotion = (b.Promotions ?? Enumerable.Empty<Promotion>())
            .Where(p => p.IsActive && p.StartAt <= nowVN && p.EndAt >= nowVN && p.DiscountValue > 0)
            .OrderByDescending(p => p.DiscountValue)
            .FirstOrDefault();

        var discountText = promotion != null
            ? $"{promotion.DiscountValue}% (Từ {promotion.StartAt:dd/MM} đến {promotion.EndAt:dd/MM})"
            : "Không có";

        var avgRating = b.BookReviews.Any() ? Math.Round(b.BookReviews.Average(r => r.Rating), 1) : 0;
        var categories = b.Categories.Any() ? string.Join(", ", b.Categories.Select(c => c.Name)) : "Không có";

        return
            $"Tên sách: {b.Title}\n" +
            $"Tác giả: {b.Author}\n" +
            $"Thể loại: {categories}\n" +
            $"Mô tả: {b.Description}\n" +
            $"Giá sách đọc (PriceSoft): {totalSoftPrice:N0} Xu\n" +
            $"Giá sách nói (PriceAudio): {totalAudioPrice:N0} Xu\n" +
            $"Khuyến mãi hiện tại: {discountText}\n" +
            $"Đánh giá trung bình: {avgRating}/5\n" +
            $"Loại: {type}\n" +
            $"Chi tiết: {frontendUrl}/bookdetails/{b.BookId}\n";
    }));

    // --- 6️⃣ Gói chuyển đổi ---
    List<Plan> plans = userId == null || userId == 0
        ? await _userRepository.GetPlansByRoleAsync("Owner")
        : (await _userRepository.GetPlansByRoleAsync("User")) ?? await _userRepository.GetPlansByRoleAsync("Owner");

    Plan? matchedPlan = null;
    if (normalizedQuestion.Contains("tuần") || normalizedQuestion.Contains("week"))
        matchedPlan = plans.FirstOrDefault(p => p.Name.Contains("tuần", StringComparison.OrdinalIgnoreCase) || p.Period.Equals("Weekly", StringComparison.OrdinalIgnoreCase));
    else if (normalizedQuestion.Contains("tháng") || normalizedQuestion.Contains("month"))
        matchedPlan = plans.FirstOrDefault(p => p.Name.Contains("tháng", StringComparison.OrdinalIgnoreCase) || p.Period.Equals("Monthly", StringComparison.OrdinalIgnoreCase));
    else if (normalizedQuestion.Contains("năm") || normalizedQuestion.Contains("year"))
        matchedPlan = plans.FirstOrDefault(p => p.Name.Contains("năm", StringComparison.OrdinalIgnoreCase) || p.Period.Equals("Yearly", StringComparison.OrdinalIgnoreCase));

    string planContext = matchedPlan != null
        ? $"Tên gói: {matchedPlan.Name}\nChu kỳ: {matchedPlan.Period}\nGiá: {matchedPlan.Price:N0} Xu\nGiới hạn chuyển đổi: {matchedPlan.ConversionLimit} lượt\nDùng thử: {(matchedPlan.TrialDays.HasValue ? matchedPlan.TrialDays + " ngày" : "Không có")}\nMua hoặc xem chi tiết gói tại: {frontendUrl}/vip\n"
        : plans.Any()
            ? string.Join("\n", plans.Select(p =>
                $"Tên gói: {p.Name} - Chu kỳ: {p.Period}, Giá: {p.Price:N0} Xu, \nGiới hạn chuyển đổi: {p.ConversionLimit} lượt\nDùng thử: {(p.TrialDays.HasValue ? p.TrialDays + " ngày" : "Không có")}\n")) +
                $"Mua hoặc xem chi tiết gói tại: {frontendUrl}/vip\n"
            : "Hiện chưa có gói chuyển đổi nào hoạt động.";

    context += "\n\n--- Các gói chuyển đổi âm thanh ---\n" + planContext;

    // --- 7️⃣ Subscription ---
    string subscriptionContext;
    if (userId != null && userId > 0)
    {
        var sub = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId.Value);
        if (sub != null && sub.Plan != null)
        {
            int totalLimit = sub.Plan.ConversionLimit;
            int remaining = sub.RemainingConversions;

            subscriptionContext = totalLimit > 0
                ? $"Người dùng hiện đang có gói '{sub.Plan.Name}' còn hiệu lực đến {sub.EndAt:dd/MM/yyyy}\nHiện còn {remaining}/{totalLimit} lượt chuyển đổi khả dụng."
                : $"Người dùng hiện đang có gói '{sub.Plan.Name}' còn hiệu lực đến {sub.EndAt:dd/MM/yyyy}\n";
        }
        else
            subscriptionContext = "Người dùng chưa có gói chuyển đổi. Có thể nâng cấp để nghe toàn bộ sách nói không giới hạn.";
    }
    else
        subscriptionContext = "Người dùng chưa đăng nhập, vui lòng đăng nhập để xem các gói đã mua.";

    context += "\n\n--- Thông tin gói chuyển đổi hiện tại ---\n" + subscriptionContext;

    // --- 8️⃣ Gửi request tới OpenAI ---
    var payload = new
    {
        model = _settings.SummaryModel,
        messages = new[]
        {
            new
            {
                role = "system",
                content = "Bạn là chatbot VieBook, hỗ trợ tìm sách, xem giá, thể loại, khuyến mãi và tư vấn gói chuyển đổi Audio. Dưới đây là dữ liệu sách và gói:\n" +
                          context + "\nChỉ dựa vào thông tin này để trả lời."
            },
            new { role = "user", content = question }
        },
        temperature = 0.3
    };

    var json = JsonSerializer.Serialize(payload);
    var response = await _httpClient.PostAsync(
        _settings.SummaryUrl ?? "https://api.openai.com/v1/chat/completions",
        new StringContent(json, Encoding.UTF8, "application/json")
    );

    var result = await response.Content.ReadAsStringAsync();
    string botResponse = "";

    if (!response.IsSuccessStatusCode)
        botResponse = $"OpenAI API lỗi: {response.StatusCode} - {result}";
    else
    {
        try
        {
            using var doc = JsonDocument.Parse(result);
            botResponse = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }
        catch
        {
            botResponse = "Không thể đọc phản hồi từ OpenAI.";
        }
    }

    // --- 9️⃣ Lưu phản hồi bot ---
    await _chatbaseRepository.AddMessageAsync(userId, botResponse, "bot");

    return botResponse;
}
    public async Task<List<ChatbaseHistory>> GetChatHistoryAsync(int? userId)
    {
        if (userId == null) return new List<ChatbaseHistory>();
        return await _chatbaseRepository.GetHistoryByUserAsync(userId);
    }
}
}
