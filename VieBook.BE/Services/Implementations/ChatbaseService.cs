using BusinessObject.Chatbase;
using BusinessObject.Models;
using BusinessObject.OpenAI;
using Microsoft.Extensions.Options;
using Repositories.Interfaces;
using Service.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using static System.Net.WebRequestMethods;


namespace Service.Implementations
{
    public class ChatbaseService : IChatbaseService
    {
        private readonly IBookRepository _bookRepository;
        private readonly HttpClient _httpClient;
        private readonly OpenAIConfig _settings;
        private readonly IChatbaseRepository _chatbaseRepository;
        private const string BookDetailLinkPrefix = "http://localhost:5173/bookdetails/"; 

        public ChatbaseService(IBookRepository bookRepository,HttpClient httpClient,IOptions<OpenAIConfig> settings,IChatbaseRepository chatbaseRepository)
        {
            _bookRepository = bookRepository;
            _httpClient = httpClient;
            _settings = settings.Value;
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
            _chatbaseRepository = chatbaseRepository;
        }

        public async Task<string> GetChatResponseAsync(string question, int? userId = null)
        {
            // Lưu tin nhắn người dùng
            await _chatbaseRepository.AddMessageAsync(userId, question, "user");

            // Lấy tất cả sách
            var books = await _bookRepository.GetAllAsync();

            if (!books.Any())
            {
                var emptyResponse = "Hiện tại không có sách nào trong cơ sở dữ liệu.";
                await _chatbaseRepository.AddMessageAsync(userId, emptyResponse, "bot");
                return emptyResponse;
            }

            // --- B1: Chuẩn hóa câu hỏi người dùng ---
            string normalizedQuestion = question.ToLower();

            // --- B2: Xác định các thể loại mà người dùng nhắc đến ---
            var allCategories = books
                .SelectMany(b => b.Categories.Select(c => c.Name.ToLower()))
                .Distinct()
                .ToList();

            var matchingCategories = allCategories
                .Where(cat => normalizedQuestion.Contains(cat))
                .ToList();

            // --- B3: Lọc sách theo thể loại, tên, hoặc tác giả ---
            var filteredBooks = books
                .Where(b =>
                    matchingCategories.Any(cat => b.Categories.Any(c => c.Name.ToLower() == cat)) ||
                    normalizedQuestion.Contains(b.Title.ToLower()) ||
                    (!string.IsNullOrEmpty(b.Author) && normalizedQuestion.Contains(b.Author.ToLower()))
                )
                .ToList();

            // Nếu không có sách nào khớp, trả về tất cả để GPT vẫn có dữ liệu
            if (!filteredBooks.Any())
                filteredBooks = books;

            // --- B4: Tạo context sách gọn gàng ---
            string context = string.Join("\n\n", filteredBooks.Select(b =>
            {
                var totalPrice = b.Chapters.Sum(c => c.PriceAudio ?? 0);
                var avgRating = b.BookReviews.Any()
                    ? Math.Round(b.BookReviews.Average(r => r.Rating), 1)
                    : 0;
                var categories = b.Categories != null && b.Categories.Any()
                    ? string.Join(", ", b.Categories.Select(c => c.Name))
                    : "Không có";

                var readUrl = b.Chapters.FirstOrDefault(c => !string.IsNullOrEmpty(c.ChapterSoftUrl))?.ChapterSoftUrl;
                var audioUrl = b.Chapters.FirstOrDefault(c => !string.IsNullOrEmpty(c.ChapterAudioUrl))?.ChapterAudioUrl;
                string type = "";
                if (readUrl != null) type += "Sách đọc";
                if (audioUrl != null) type += (type != "" ? ", " : "") + "Sách nói";
                if (string.IsNullOrEmpty(type)) type = "Không xác định";

                return
                    $"Tên sách: {b.Title}\n" +
                    $"Tác giả: {b.Author}\n" +
                    $"Mô tả: {b.Description}\n" +
                    $"Thể loại: {categories}\n" +
                    $"Giá: {totalPrice:N0} Xu\n" +
                    $"Đánh giá trung bình: {avgRating}/5\n" +
                    $"Loại: {type}\n" +
                    $"chi tiết: {BookDetailLinkPrefix}{b.BookId}\n";
            }));

            // --- B5: Gửi request đến OpenAI ---
            var payload = new
            {
                model = _settings.SummaryModel, // ví dụ "gpt-4o-mini"
                messages = new[]
                {
                    new
                    {
                        role = "system",
                        content =
                            "Bạn là chatbot hỗ trợ người dùng tìm và gợi ý sách phù hợp. " +
                            "Khi gợi ý sách, hãy luôn hiển thị 'Link chi tiết' đi kèm. " +
                            "Dưới đây là danh sách sách có sẵn trong hệ thống:\n" +
                            context +
                            "\nHãy trả lời **chỉ dựa trên danh sách này**. Nếu sách hoặc thể loại không có trong danh sách, hãy nói rõ."
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
                using var doc = JsonDocument.Parse(result);
                try
                {
                    botResponse = doc.RootElement
                                    .GetProperty("choices")[0]
                                    .GetProperty("message")
                                    .GetProperty("content")
                                    .GetString() ?? "";
                }
                catch
                {
                    botResponse = "Không thể đọc phản hồi từ OpenAI";
                }
            }

            // --- B6: Lưu phản hồi bot vào DB ---
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
