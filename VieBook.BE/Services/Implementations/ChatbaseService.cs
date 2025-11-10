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
        var books = await _bookRepository.GetAllAsync();

        if (!books.Any())
        {
            var emptyResponse = "Hiện tại không có sách nào trong hệ thống.";
            await _chatbaseRepository.AddMessageAsync(userId, emptyResponse, "bot");
            return emptyResponse;
        }

        // --- 3️⃣ Chuẩn hóa câu hỏi ---
        string normalizedQuestion = question.ToLower();

        // --- 4️⃣ Lọc thể loại hoặc tên sách được nhắc đến ---
        var allCategories = books
            .SelectMany(b => b.Categories.Select(c => c.Name.ToLower()))
            .Distinct()
            .ToList();

        var matchingCategories = allCategories
            .Where(cat => normalizedQuestion.Contains(cat))
            .ToList();

        var filteredBooks = books
            .Where(b =>
                b.Status == "Approved" &&
                (matchingCategories.Any(cat => b.Categories.Any(c => c.Name.ToLower() == cat)) ||
                normalizedQuestion.Contains(b.Title.ToLower()) ||
                (!string.IsNullOrEmpty(b.Author) && normalizedQuestion.Contains(b.Author.ToLower()))))
            .ToList();

        if (!filteredBooks.Any())
            filteredBooks = books.Where(b => b.Status == "Approved").ToList();

        // --- 5️⃣ Tạo context về sách ---
        string context = string.Join("\n\n", filteredBooks.Select(b =>
        {
            // Lọc chương active
            var activeChapters = b.Chapters
                .Where(c => c.Status == "Active")
                .ToList();

            // --- Xác định sách đọc ---
            var readChapters = activeChapters
                .Where(c => !string.IsNullOrEmpty(c.ChapterSoftUrl))
                .ToList();

            // --- Xác định sách nói ---
            var audioChapters = activeChapters
                .Where(c => c.ChapterAudios != null &&
                            c.ChapterAudios.Any(a => !string.IsNullOrEmpty(a.AudioLink)))
                .ToList();

            // --- Giá ---
            var totalSoftPrice = readChapters.Sum(c => c.PriceSoft ?? 0);
            var totalAudioPrice = audioChapters.Sum(c =>
                c.ChapterAudios.FirstOrDefault(a => !string.IsNullOrEmpty(a.AudioLink))?.PriceAudio ?? 0);

            // --- Phân loại ---
            string type = (readChapters.Any(), audioChapters.Any()) switch
            {
                (true, true) => "Sách đọc và sách nói",
                (true, false) => "Sách đọc",
                (false, true) => "Sách nói",
                _ => "Không xác định"
            };

            // --- Khuyến mãi ---
            var promotion = b.Promotions?.FirstOrDefault(p =>
                p.IsActive && p.StartAt <= DateTime.UtcNow && p.EndAt >= DateTime.UtcNow);

            var discountText = promotion != null
                ? $"{promotion.DiscountValue}% (Từ {promotion.StartAt:dd/MM} đến {promotion.EndAt:dd/MM})"
                : "Không có";

            // --- Đánh giá ---
            var avgRating = b.BookReviews.Any()
                ? Math.Round(b.BookReviews.Average(r => r.Rating), 1)
                : 0;

            // --- Thể loại ---
            var categories = b.Categories != null && b.Categories.Any()
                ? string.Join(", ", b.Categories.Select(c => c.Name))
                : "Không có";

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

        // --- 6️⃣ Thêm context gói chuyển đổi ---
        List<Plan> plans = new List<Plan>();

        if (userId == null || userId == 0)
        {
        // Guest → hiển thị gói Owner
        plans = await _userRepository.GetPlansByRoleAsync("Owner");
        }
        else
        {
        // User → lấy gói User, nếu không có thì fallback sang Owner
        plans = await _userRepository.GetPlansByRoleAsync("User");
        if (plans == null || !plans.Any())
            plans = await _userRepository.GetPlansByRoleAsync("Owner");
        }

    // --- Kiểm tra từ khóa trong câu hỏi ---
        Plan? matchedPlan = null;
        if (normalizedQuestion.Contains("tuần") || normalizedQuestion.Contains("week"))
        {
            matchedPlan = plans.FirstOrDefault(p =>
                p.Name.Contains("tuần", StringComparison.OrdinalIgnoreCase) ||
                p.Period.Equals("Weekly", StringComparison.OrdinalIgnoreCase));
        }
        else if (normalizedQuestion.Contains("tháng") || normalizedQuestion.Contains("month"))
        {
            matchedPlan = plans.FirstOrDefault(p =>
                p.Name.Contains("tháng", StringComparison.OrdinalIgnoreCase) ||
                p.Period.Equals("Monthly", StringComparison.OrdinalIgnoreCase));
        }
        else if (normalizedQuestion.Contains("năm") || normalizedQuestion.Contains("year"))
        {
            matchedPlan = plans.FirstOrDefault(p =>
                p.Name.Contains("năm", StringComparison.OrdinalIgnoreCase) ||
                p.Period.Equals("Yearly", StringComparison.OrdinalIgnoreCase));
        }

    // --- Xây context hiển thị ---
    string planContext;

    if (matchedPlan != null)
    {
        // ✅ Nếu người dùng nhắc đúng 1 gói
        planContext =
            $"Tên gói: {matchedPlan.Name}\n" +
            $"Chu kỳ: {matchedPlan.Period}\n" +
            $"Giá: {matchedPlan.Price:N0} Xu\n" +
            $"Giới hạn chuyển đổi: {matchedPlan.ConversionLimit} lượt\n" +
            $"Dùng thử: {(matchedPlan.TrialDays.HasValue ? matchedPlan.TrialDays + " ngày" : "Không có")}\n" +
            $"Mua hoặc xem chi tiết gói tại: {frontendUrl}/vip\n";
    }
    else
    {
        // ✅ Nếu người dùng hỏi chung chung (“các gói audio”)
        planContext = plans.Any()
            ? string.Join("\n", plans.Select(p =>
                $"Tên gói: {p.Name} - Chu kỳ: {p.Period}, Giá: {p.Price:N0} Xu, \n" +
                $"Giới hạn chuyển đổi: {p.ConversionLimit} lượt\n" +
                $"Dùng thử: {(p.TrialDays.HasValue ? p.TrialDays + " ngày" : "Không có")}\n")) +
                $"Mua hoặc xem chi tiết gói tại: {frontendUrl}/vip\n"
            : "Hiện chưa có gói chuyển đổi nào hoạt động.";
            
    }

    context += "\n\n--- Các gói chuyển đổi âm thanh ---\n" + planContext;

        // --- 7️⃣ Kiểm tra gói Premium hiện tại của user ---
        string subscriptionContext;
            if (userId != null && userId > 0)
            {
                var sub = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId.Value);
                if (sub != null && sub.Plan != null)
                {
                    int totalLimit = sub.Plan.ConversionLimit;
                    int remaining = sub.RemainingConversions;

                    if (totalLimit > 0)
                    {
                        subscriptionContext =
                            $"Người dùng hiện đang có gói '{sub.Plan.Name}' còn hiệu lực đến {sub.EndAt:dd/MM/yyyy}\n" +
                            $"Hiện còn {remaining}/{totalLimit} lượt chuyển đổi khả dụng.";
                    }
                    else
                    {
                        subscriptionContext =
                            $"Người dùng hiện đang có gói '{sub.Plan.Name}' còn hiệu lực đến {sub.EndAt:dd/MM/yyyy}\n";
                    }
                }
                else
                {
                    subscriptionContext = "Người dùng chưa có gói chuyển đổi. Có thể nâng cấp để nghe toàn bộ sách nói không giới hạn.";
                }
            }
            else
            {
                subscriptionContext = "Người dùng chưa đăng nhập, vui lòng đăng nhập để xem các gói đã mua.";
            }

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
                    content =
                        "Bạn là chatbot VieBook, hỗ trợ tìm sách, xem giá, thể loại, khuyến mãi và tư vấn gói chuyển đổi Audio. " +
                        "Dưới đây là dữ liệu sách và gói:\n" +
                        context +
                        "\nChỉ dựa vào thông tin này để trả lời."
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
        {
            botResponse = $"OpenAI API lỗi: {response.StatusCode} - {result}";
        }
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
