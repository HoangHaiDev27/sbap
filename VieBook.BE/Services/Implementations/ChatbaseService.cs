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
    string q = question.ToLower().Trim();
    var nowVN = DateTime.UtcNow.AddHours(7);

    await _chatbaseRepository.AddMessageAsync(userId, question, "user");

    // ==============================
    // 1) XỬ LÝ GÓI VIP / CHUYỂN ĐỔI
    // ==============================
    bool isVipQuery = q.Contains("gói") || q.Contains("vip") || q.Contains("premium")
                   || q.Contains("tuần") || q.Contains("tháng") || q.Contains("năm")
                   || q.Contains("nâng cấp") || q.Contains("mua gói") || q.Contains("giá gói");

    if (isVipQuery && !q.Contains("sách") && !q.Contains("tác giả"))
    {
        var plans = await _userRepository.GetPlansByRoleAsync("Owner");
        if (plans == null || !plans.Any())
        {
            string noPlan = "Hiện chưa có gói nào khả dụng.";
            await _chatbaseRepository.AddMessageAsync(userId, noPlan, "bot");
            return noPlan;
        }

        string subscriptionContext = "";
        if (userId != null && userId > 0)
        {
            var sub = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId.Value);
            if (sub != null && sub.Plan != null)
            {
                subscriptionContext =
                    $"Bạn đang dùng gói '{sub.Plan.Name}' (Chu kỳ: {sub.Plan.Period})\n" +
                    $"Còn hiệu lực đến {sub.EndAt:dd/MM/yyyy}\n" +
                    $"Lượt chuyển đổi còn lại: {sub.RemainingConversions}/{sub.Plan.ConversionLimit}";
            }
            else subscriptionContext = "Bạn chưa có gói chuyển đổi nào. Hãy chọn một gói phù hợp để nâng cấp.";
        }
        else subscriptionContext = "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem gói và nâng cấp.";

        string planContext = string.Join("\n\n", plans.Select(p =>
            $"Tên gói: {p.Name}\nChu kỳ: {p.Period}\nGiá: {p.Price:N0} Xu\nGiới hạn chuyển đổi: {p.ConversionLimit}\nDùng thử: {(p.TrialDays.HasValue ? p.TrialDays + " ngày" : "Không có")}\nLink mua: {frontendUrl}/vip"));

        string payloadContent = $"--- Danh sách các gói ---\n{planContext}\n\n--- Gói hiện tại của bạn ---\n{subscriptionContext}";

        var payload = new
        {
            model = _settings.SummaryModel,
            messages = new[]
            {
                new { role = "system", content = "Bạn là chatbot VieBook.\nTrả lời chi tiết về các gói chuyển đổi audio dựa trên dữ liệu sau:\n" + payloadContent },
                new { role = "user", content = question }
            },
            temperature = 0.3
        };

        var json = JsonSerializer.Serialize(payload);
        var response = await _httpClient.PostAsync(
            _settings.SummaryUrl ?? "https://api.openai.com/v1/chat/completions",
            new StringContent(json, Encoding.UTF8, "application/json")
        );

        string botResponse = "";
        if (!response.IsSuccessStatusCode)
        {
            botResponse = $"OpenAI API lỗi: {response.StatusCode}";
        }
        else
        {
            var result = await response.Content.ReadAsStringAsync();
            try
            {
                using var doc = JsonDocument.Parse(result);
                botResponse = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? "";
            }
            catch { botResponse = "Không thể đọc phản hồi từ OpenAI."; }
        }

        await _chatbaseRepository.AddMessageAsync(userId, botResponse, "bot");
        return botResponse;
    }

    // ==============================
    // 2) LẤY TẤT CẢ SÁCH
    // ==============================
    var books = await _bookRepository.GetAllInforAsync();
    if (!books.Any())
    {
        string msg = "Hiện tại không có sách nào trong hệ thống.";
        await _chatbaseRepository.AddMessageAsync(userId, msg, "bot");
        return msg;
    }

    // ==============================
    // 3) ƯU TIÊN KHÔNG – KHÁCH HỎI KHUYẾN MÃI
    // ==============================
    if (q.Contains("khuyến") || q.Contains("giảm") || q.Contains("sale") || q.Contains("discount"))
    {
        var promoBooks = books
            .Where(b => b.Status == "Approved" &&
                        b.Promotions?.Any(p =>
                            p.IsActive &&
                            p.StartAt <= nowVN &&
                            p.EndAt >= nowVN &&
                            p.DiscountValue > 0) == true)
            .ToList();

        if (!promoBooks.Any())
        {
            string noPromo = "Hiện tại không có sách nào đang có khuyến mãi.";
            await _chatbaseRepository.AddMessageAsync(userId, noPromo, "bot");
            return noPromo;
        }

        books = promoBooks;
    }

    // ==============================
    // 4) ƯU TIÊN – KHÁCH HỎI “SÁCH NÓI”
    // ==============================
    bool askingAudioBook = q.Contains("sách nói") || q.Contains("audio") || q.Contains("nói");

    List<Book> filteredBooks = new();

    if (askingAudioBook)
    {
        filteredBooks = books
            .Where(b =>
                b.Status == "Approved" &&
                b.Chapters.Any(c =>
                    c.ChapterAudios != null &&
                    c.ChapterAudios.Any(a => !string.IsNullOrEmpty(a.AudioLink))
                )
            )
            .ToList();

        if (!filteredBooks.Any())
        {
            string msg = "Hiện tại không có sách nói nào trong kho.";
            await _chatbaseRepository.AddMessageAsync(userId, msg, "bot");
            return msg;
        }
    }

    // ==============================
    // 5) LỌC THEO TÊN / TÁC GIẢ / CATEGORY
    // ==============================
    if (!filteredBooks.Any()) // chưa có filter, áp vào filter sách
    {
        filteredBooks = books
            .Where(b => b.Status == "Approved" &&
                        (q.Contains(b.Title.ToLower()) ||
                         (!string.IsNullOrEmpty(b.Author) && q.Contains(b.Author.ToLower())) ||
                         (b.Categories?.Any(c => q.Contains(c.Name.ToLower())) == true)))
            .ToList();

        if (!filteredBooks.Any())
            filteredBooks = books.Where(b => b.Status == "Approved").ToList();
    }

    // ==============================
    // 6) BUILD CONTEXT SÁCH
    // ==============================
    string bookContext = string.Join("\n\n", filteredBooks.Select(b =>
    {
        var activeChapters = b.Chapters.Where(c => c.Status == "Active").ToList();

        var softPrice = activeChapters
            .Where(c => !string.IsNullOrEmpty(c.ChapterSoftUrl))
            .Sum(c => c.PriceSoft ?? 0);

        var audioPrice = activeChapters
            .Where(c => c.ChapterAudios?.Any(a => !string.IsNullOrEmpty(a.AudioLink)) == true)
            .Sum(c => c.ChapterAudios.FirstOrDefault(a => !string.IsNullOrEmpty(a.AudioLink))?.PriceAudio ?? 0);

        bool hasAudio = activeChapters.Any(c =>
            c.ChapterAudios != null &&
            c.ChapterAudios.Any(a => !string.IsNullOrEmpty(a.AudioLink))
        );

        bool hasSoft = softPrice > 0;

        string type = (hasSoft, hasAudio) switch
        {
            (true, true) => "Sách đọc và nói",
            (true, false) => "Sách đọc",
            (false, true) => "Sách nói",
            _ => "Không xác định"
        };

        var discount = b.Promotions?
            .Where(p => p.IsActive && p.StartAt <= nowVN && p.EndAt >= nowVN && p.DiscountValue > 0)
            .OrderByDescending(p => p.DiscountValue)
            .FirstOrDefault();

        string discountText = discount != null
            ? $"{discount.DiscountValue}% (Từ {discount.StartAt:dd/MM} đến {discount.EndAt:dd/MM})"
            : "Không có";

        string categories = b.Categories?.Any() == true
            ? string.Join(", ", b.Categories.Select(c => c.Name))
            : "Không có";

        double rating = b.BookReviews.Any()
            ? Math.Round(b.BookReviews.Average(r => r.Rating), 1)
            : 0;

        return
            $"Tên sách: {b.Title}\n" +
            $"Tác giả: {b.Author}\n" +
            $"Thể loại: {categories}\n" +
            $"Giá đọc: {softPrice:N0} Xu\n" +
            $"Giá nói: {audioPrice:N0} Xu\n" +
            $"Khuyến mãi: {discountText}\n" +
            $"Đánh giá: {rating}/5\n" +
            $"Loại: {type}\n" +
            $"Chi tiết: {frontendUrl}/bookdetails/{b.BookId}";
    }));

    // ==============================
    // 7) GỌI OPENAI CHO SÁCH
    // ==============================
    var bookPayload = new
    {
        model = _settings.SummaryModel,
        messages = new[]
        {
            new { role = "system", content = "Bạn là chatbot VieBook hỗ trợ tìm sách, xem giá, khuyến mãi, đánh giá.\nChỉ trả lời dựa trên dữ liệu sau:\n" + bookContext },
            new { role = "user", content = question }
        },
        temperature = 0.3
    };

    string bookJson = JsonSerializer.Serialize(bookPayload);
    var bookResponse = await _httpClient.PostAsync(
        _settings.SummaryUrl ?? "https://api.openai.com/v1/chat/completions",
        new StringContent(bookJson, Encoding.UTF8, "application/json")
    );

    string bookBotResponse = "";
    if (!bookResponse.IsSuccessStatusCode)
    {
        bookBotResponse = $"OpenAI API lỗi: {bookResponse.StatusCode}";
    }
    else
    {
        var result = await bookResponse.Content.ReadAsStringAsync();
        try
        {
            using var doc = JsonDocument.Parse(result);
            bookBotResponse = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";
        }
        catch { bookBotResponse = "Không thể đọc phản hồi từ OpenAI."; }
    }

    await _chatbaseRepository.AddMessageAsync(userId, bookBotResponse, "bot");
    return bookBotResponse;
}



    public async Task<List<ChatbaseHistory>> GetChatHistoryAsync(int? userId)
    {
        if (userId == null) return new List<ChatbaseHistory>();
        return await _chatbaseRepository.GetHistoryByUserAsync(userId);
    }
}
}
