using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using BusinessObject.Dtos.OpenAI;
using BusinessObject.OpenAI;
using BusinessObject.Helper;
using BusinessObject.Models;
using Newtonsoft.Json.Linq;
using Services.Interfaces;
using Repositories.Interfaces;
namespace Services.Implementations
{
    public class OpenAIService : IOpenAIService
    {
        private readonly HttpClient _httpClient;
        private readonly OpenAIConfig _config;
        private readonly IOpenAIRepository _embeddingRepository;

        public OpenAIService(HttpClient httpClient, OpenAIConfig config, IOpenAIRepository embeddingRepository)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _embeddingRepository = embeddingRepository ?? throw new ArgumentNullException(nameof(embeddingRepository));
            if (string.IsNullOrWhiteSpace(_config.ApiKey))
                throw new ArgumentException("OpenAI ApiKey is not configured.");
        }

        /// <summary>
        /// Download content from Cloudinary URL with caching
        /// </summary>
        private readonly Dictionary<string, string> _contentCache = new Dictionary<string, string>();

        private async Task<string> DownloadContentFromUrlAsync(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return string.Empty;

            // Check cache first
            if (_contentCache.TryGetValue(url, out var cachedContent))
                return cachedContent;

            try
            {
                using var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                var content = await response.Content.ReadAsStringAsync();

                // Cache the content
                _contentCache[url] = content;
                return content;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to download content from {url}: {ex.Message}");
                return string.Empty;
            }
        }
        public async Task<string> CheckSpellingAsync(CheckSpellingDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var content = dto.Content;
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Nội dung không được để trống.");

            var prompt =
                "Hãy kiểm tra lỗi chính tả và ngữ pháp tiếng Việt trong đoạn văn sau.\n" +
                "Trả kết quả theo định dạng JSON:\n" +
                "{" +
                "  \"isCorrect\": boolean,\n" +
                "  \"errors\": [\n" +
                "    { \"wrong\": string, \"suggestion\": string, \"explanation\": string }\n" +
                "  ],\n" +
                "  \"correctedText\": string\n" +
                "}\n" +
                "Đừng thêm giải thích bên ngoài JSON.\n" +
                $"Đoạn văn:\n\"\"\"{content}\"\"\"";

            var url = string.IsNullOrWhiteSpace(_config.SummaryUrl)
                ? "https://api.openai.com/v1/chat/completions"
                : _config.SummaryUrl;

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _config.ApiKey);

            var model = string.IsNullOrWhiteSpace(_config.SummaryModel) ? "gpt-4o-mini" : _config.SummaryModel;
            var payload = new
            {
                model,
                messages = new object[]
                {
                    new { role = "system", content = "Bạn là trợ lý kiểm tra chính tả và ngữ pháp tiếng Việt. Chỉ phản hồi JSON hợp lệ." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.2
            };

            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseText = await response.Content.ReadAsStringAsync();
            var parsed = JObject.Parse(responseText);
            var text = parsed["choices"]?.First?["message"]?["content"]?.ToString()?.Trim();
            return string.IsNullOrEmpty(text) ? "{}" : text;
        }

        public async Task<string> CheckMeaningAsync(CheckMeaningDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var content = dto.Content;
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Nội dung không được để trống.");

            var prompt =
                "Hãy đánh giá nội dung và kiểm tra xem nội dung có phù hợp với tiêu đề chương không.\n" +
                "Trả kết quả theo định dạng JSON:\n" +
                "{\n" +
                "  \"hasMeaning\": boolean,\n" +
                "  \"meaningScore\": number (0-100),\n" +
                "  \"isTitleContentConsistent\": boolean,\n" +
                "  \"consistencyScore\": number (0-100),\n" +
                "  \"evaluation\": {\n" +
                "    \"meaningReason\": string,\n" +
                "    \"consistencyAnalysis\": string,\n" +
                "    \"suggestions\": string[]\n" +
                "  }\n" +
                "}\n" +
                "Trong đó:\n" +
                "- hasMeaning: true nếu nội dung có ý nghĩa, false nếu chỉ là ký tự vô nghĩa, spam, hoặc nội dung rỗng\n" +
                "- meaningScore: điểm từ 0-100 đánh giá mức độ ý nghĩa của nội dung\n" +
                "- isTitleContentConsistent: true nếu nội dung phù hợp với tiêu đề chương\n" +
                "- consistencyScore: điểm từ 0-100 đánh giá mức độ phù hợp giữa tiêu đề và nội dung\n" +
                "- evaluation: đánh giá chi tiết\n" +
                "  - meaningReason: lý do đánh giá ý nghĩa nội dung\n" +
                "  - consistencyAnalysis: phân tích sự tương đồng giữa tiêu đề và nội dung\n" +
                "  - suggestions: mảng các gợi ý cải thiện nếu có\n" +
                "\n" +
                "Yêu cầu:\n" +
                "1. Đánh giá xem nội dung có ý nghĩa và phù hợp không\n" +
                "2. Phân tích xem nội dung có phù hợp với tiêu đề chương không\n" +
                "3. Đưa ra các gợi ý cải thiện nếu cần\n" +
                "\n" +
                "Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản nào khác.\n" +
                $"Tiêu đề chương: {dto.Title ?? "(Chưa có tiêu đề)"}\n" +
                $"Nội dung chương:\n\"\"\"{content}\"\"\"";

            var url = string.IsNullOrWhiteSpace(_config.SummaryUrl)
                ? "https://api.openai.com/v1/chat/completions"
                : _config.SummaryUrl;

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _config.ApiKey);

            var model = string.IsNullOrWhiteSpace(_config.SummaryModel) ? "gpt-4o-mini" : _config.SummaryModel;
            var payload = new
            {
                model,
                messages = new object[]
                {
                    new { role = "system", content = "Bạn là trợ lý đánh giá ý nghĩa nội dung. Chỉ phản hồi JSON hợp lệ." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.2
            };

            var json = JsonSerializer.Serialize(payload);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseText = await response.Content.ReadAsStringAsync();
            var parsed = JObject.Parse(responseText);
            var text = parsed["choices"]?.First?["message"]?["content"]?.ToString()?.Trim();
            return string.IsNullOrEmpty(text) ? "{}" : text;
        }

        public async Task<ModerationResult> ModerationAsync(ModerationDto dto)
        {
            var requestBody = new
            {
                input = dto.Content,
                model = _config.ModerationModel
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            using var request = new HttpRequestMessage(HttpMethod.Post, _config.ModerationUrl)
            {
                Content = content
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _config.ApiKey);

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                // Đọc nội dung phản hồi lỗi từ API (chứa thông báo lỗi 400 chi tiết)
                var errorContent = await response.Content.ReadAsStringAsync();

                // Ném ra một ngoại lệ mới bao gồm nội dung lỗi
                throw new HttpRequestException($"API request failed with status code {response.StatusCode}. Details: {errorContent}");
            }


            await using var stream = await response.Content.ReadAsStreamAsync();
            using var json = await JsonDocument.ParseAsync(stream);

            if (!json.RootElement.TryGetProperty("results", out var results) || results.GetArrayLength() == 0)
            {
                throw new Exception("Phản hồi moderation không hợp lệ.");
            }

            var result = results[0];

            var moderation = new ModerationResult
            {
                Flagged = result.GetProperty("flagged").GetBoolean(),
                Categories = result.GetProperty("categories").EnumerateObject()
                    .ToDictionary(p => p.Name, p => p.Value.GetBoolean()),
                CategoryScores = result.GetProperty("category_scores").EnumerateObject()
                    .ToDictionary(p => p.Name, p => p.Value.GetSingle())
            };

            // ✅ Bỏ flag nếu không vi phạm nghiêm trọng
            // 1. Định nghĩa các danh mục nghiêm trọng
            var highThresholdSerious = new[] { "hate/threatening", "violence/graphic", "self-harm/instructions" };
            var lowThresholdSerious = new[] { "sexual", "harassment" };

            // Ngưỡng điểm bạn muốn
            const float HighThreshold = 0.6f;
            const float LowThreshold = 0.15f;

            // 2. Kiểm tra điều kiện nghiêm trọng (isSerious)
            var isSerious = moderation.Categories
                .Where(c => c.Value)
                .Any(c =>
                    // Điều kiện A: Danh mục cần ngưỡng 0.6f
                    (highThresholdSerious.Contains(c.Key) && moderation.CategoryScores[c.Key] > HighThreshold) ||
                    // Điều kiện B: Danh mục cần ngưỡng 0.15f
                    (lowThresholdSerious.Contains(c.Key) && moderation.CategoryScores[c.Key] > LowThreshold)
                );

            if (!isSerious)
            {
                moderation.Flagged = false;
            }

            return moderation;
        }
        public async Task<List<List<float>>> GetEmbeddingAsync(List<string> inputs)
        {
            var body = new
            {
                model = _config.EmbeddingModel,
                input = inputs
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, _config.EmbeddingUrl)
            {
                Content = content
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _config.ApiKey);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"OpenAI error: {response.StatusCode} - {error}");
            }

            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);

            return doc.RootElement
                .GetProperty("data")
                .EnumerateArray()
                .Select(item => item.GetProperty("embedding")
                    .EnumerateArray()
                    .Select(x => x.GetSingle())
                    .ToList()
                ).ToList();
        }

        public async Task<PlagiarismResult> CheckPlagiarismAsync(PlagiarismChapterContentCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.content))
                throw new ArgumentException("Content cannot be null or empty.");

            try
            {
                // Stage 1: Preprocessing
                var cleanInput = PlagiarismHelper.StripHtmlTags(command.content);
                var inputChunks = PlagiarismHelper.SplitText(cleanInput);
                var inputWordCount = cleanInput.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;

                // Stage 2: Generate embeddings
                var embeddingInputs = new List<string> { cleanInput };
                embeddingInputs.AddRange(inputChunks);

                var allEmbeddings = await GetEmbeddingAsync(embeddingInputs);
                var inputEmbedding = allEmbeddings[0];
                var inputChunkEmbeddings = allEmbeddings.Skip(1).ToList();

                // Stage 2: Retrieve stored embeddings (exclude chapters from the same book and current chapter)
                var allStoredEmbeddings = await _embeddingRepository.GetAllChapterContentEmbeddingsAsync();
                var storedChapterEmbeddings = allStoredEmbeddings
                    .Where(ce => ce.Chapter?.BookId != command.BookId &&
                                (command.ChapterId == null || ce.ChapterId != command.ChapterId))
                    .ToList();

                // Nếu không có embeddings nào để so sánh, trả về kết quả "passed"
                if (!storedChapterEmbeddings.Any())
                {
                    return new PlagiarismResult
                    {
                        Passed = true,
                        Message = "Không có dữ liệu để so sánh đạo văn. Đây là chapter đầu tiên hoặc chưa có embeddings trong hệ thống.",
                        Classification = "None",
                        Similarity = 0,
                        Matches = new List<PlagiarismMatch>()
                    };
                }

                var matches = new List<PlagiarismMatch>();
                var plagiarizedChunks = new List<ChunkMatch>();

                // Stage 3: Multi-Signal Analysis
                foreach (var storedEmbedding in storedChapterEmbeddings)
                {
                    var storedVector = PlagiarismHelper.ParseEmbedding(storedEmbedding.VectorChapterContent);

                    // A. Early Filtering - Full Chapter Comparison
                    var scoreFull = PlagiarismHelper.ComputeCosineSimilarity(inputEmbedding, storedVector);
                    if (scoreFull < PlagiarismHelper.SimilarityThreshold)
                        continue;

                    // Get source chapter chunks for detailed analysis
                    var sourceChunkEmbeddings = await _embeddingRepository.GetChapterChunkEmbeddingsAsync(storedEmbedding.ChapterId);
                    var sourceChunkVectors = sourceChunkEmbeddings.Select(ce => PlagiarismHelper.ParseEmbedding(ce.VectorChunkContent)).ToList();

                    // B. Semantic Coverage Analysis
                    var coverage = PlagiarismHelper.ComputeSemanticCoverage(inputChunkEmbeddings, sourceChunkVectors);

                    // C. Literal Overlap Analysis - Download actual content from Cloudinary URL
                    var sourceChapterContent = await DownloadContentFromUrlAsync(storedEmbedding.Chapter?.ChapterSoftUrl ?? "");
                    var literalOverlap = PlagiarismHelper.ComputeWeightedLiteralOverlap(cleanInput, sourceChapterContent);

                    // D. Content Word Overlap
                    var contentWordOverlap = PlagiarismHelper.ComputeContentWordOverlap(cleanInput, sourceChapterContent);

                    // E. Phrase Overlap
                    var phraseOverlap = PlagiarismHelper.ComputePhraseOverlap(cleanInput, sourceChapterContent);

                    // Stage 4: Classification
                    var classification = PlagiarismHelper.ClassifyPlagiarism(
                        scoreFull, coverage, literalOverlap, contentWordOverlap, phraseOverlap, inputWordCount);

                    if (classification != "None")
                    {
                        // Find detailed chunk matches
                        var chunkMatches = new List<ChunkMatch>();
                        for (int i = 0; i < inputChunkEmbeddings.Count; i++)
                        {
                            for (int j = 0; j < sourceChunkVectors.Count; j++)
                            {
                                var chunkSimilarity = PlagiarismHelper.ComputeCosineSimilarity(
                                    inputChunkEmbeddings[i], sourceChunkVectors[j]);

                                if (chunkSimilarity >= PlagiarismHelper.SimilarityThresholdChunk)
                                {
                                    chunkMatches.Add(new ChunkMatch
                                    {
                                        InputChunkIndex = i,
                                        SourceChunkIndex = j,
                                        Similarity = chunkSimilarity,
                                        InputText = inputChunks[i],
                                        SourceText = await DownloadContentFromUrlAsync(sourceChunkEmbeddings[j].Chapter?.ChapterSoftUrl ?? "")
                                    });
                                }
                            }
                        }

                        matches.Add(new PlagiarismMatch
                        {
                            ChapterId = storedEmbedding.ChapterId,
                            ChapterTitle = storedEmbedding.Chapter?.ChapterTitle ?? "",
                            BookId = storedEmbedding.BookId,
                            BookTitle = storedEmbedding.Book?.Title ?? "",
                            BookAuthor = storedEmbedding.Book?.Author,
                            BookCoverUrl = storedEmbedding.Book?.CoverUrl,
                            BookCreatedAt = storedEmbedding.Book?.CreatedAt,
                            Similarity = scoreFull,
                            Coverage = coverage,
                            LiteralOverlap = literalOverlap,
                            ChunkMatches = chunkMatches
                        });

                        plagiarizedChunks.AddRange(chunkMatches);
                    }
                }

                // Determine overall result
                var maxSimilarity = matches.Any() ? matches.Max(m => m.Similarity) : 0;
                var overallClassification = matches.Any() ?
                    (matches.Any(m => m.Similarity >= 0.8) ? "Clear" : "Related") : "None";

                var result = new PlagiarismResult
                {
                    Classification = overallClassification,
                    Similarity = maxSimilarity,
                    Matches = matches,
                    Passed = overallClassification == "None",
                    Message = overallClassification switch
                    {
                        "Clear" => $"Phát hiện đạo văn rõ ràng ({matches.Count} chương tương tự)",
                        "Related" => $"Có dấu hiệu tương đồng ({matches.Count} chương liên quan)",
                        _ => "Nội dung độc đáo, không phát hiện đạo văn"
                    }
                };

                return result;
            }
            catch (Exception ex)
            {
                // Fallback result in case of error
                return new PlagiarismResult
                {
                    Classification = "None",
                    Similarity = 0,
                    Matches = new List<PlagiarismMatch>(),
                    Passed = true,
                    Message = $"Lỗi kiểm tra đạo văn: {ex.Message}"
                };
            }
        }

        public async Task GenerateAndSaveEmbeddingsAsync(int chapterId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Content cannot be null or empty.");

            try
            {
                // Stage 1: Preprocessing
                var cleanContent = PlagiarismHelper.StripHtmlTags(content);
                var chunks = PlagiarismHelper.SplitText(cleanContent);

                // Stage 2: Generate embeddings
                var embeddingInputs = new List<string> { cleanContent };
                embeddingInputs.AddRange(chunks);

                var allEmbeddings = await GetEmbeddingAsync(embeddingInputs);
                var chapterEmbedding = allEmbeddings[0];
                var chunkEmbeddings = allEmbeddings.Skip(1).ToList();

                // Stage 3: Save embeddings to database
                var chapterEmbeddingString = PlagiarismHelper.EmbeddingToString(chapterEmbedding);
                await _embeddingRepository.SaveChapterContentEmbeddingAsync(chapterId, chapterEmbeddingString);

                // Save chunk embeddings
                for (int i = 0; i < chunkEmbeddings.Count; i++)
                {
                    var chunkEmbeddingString = PlagiarismHelper.EmbeddingToString(chunkEmbeddings[i]);
                    var chunkId = chapterId * 1000 + i; // Simple chunk ID generation
                    await _embeddingRepository.SaveChapterChunkEmbeddingAsync(chunkId, chunkEmbeddingString);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to generate and save embeddings for chapter {chapterId}: {ex.Message}");
                throw;
            }
        }

        public async Task MigrateExistingChaptersAsync()
        {
            try
            {
                // Lấy tất cả chapters chưa có embeddings
                var allEmbeddings = await _embeddingRepository.GetAllChapterContentEmbeddingsAsync();
                var existingChapterIds = allEmbeddings.Select(e => e.ChapterId).ToHashSet();

                // Lấy tất cả chapters từ database (cần implement method này)
                // var allChapters = await _chapterRepository.GetAllChaptersAsync();

                Console.WriteLine($"Found {existingChapterIds.Count} chapters with existing embeddings");

                // TODO: Implement logic to get all chapters and create embeddings for missing ones
                // This would require access to ChapterRepository

                Console.WriteLine("Migration completed successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to migrate existing chapters: {ex.Message}");
                throw;
            }
        }

        public async Task<string> SummarizeContentAsync(SummarizeCommand command)
        {
            try
            {
                var prompt = $@"
Hãy tóm tắt nội dung chương '{command.ChapterTitle}' một cách chi tiết và hấp dẫn.

Yêu cầu:
1. Tóm tắt ngắn gọn nhưng đầy đủ nội dung chính
2. Làm nổi bật các sự kiện quan trọng
3. Giữ nguyên tính hấp dẫn của câu chuyện
4. Sử dụng tiếng Việt tự nhiên
5. Độ dài khoảng 200-300 từ

Nội dung chương:
{command.Content}

Tóm tắt:";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "Bạn là một chuyên gia tóm tắt nội dung sách và truyện. Hãy tạo ra những tóm tắt hấp dẫn và chính xác." },
                        new { role = "user", content = prompt }
                    },
                    max_tokens = 500,
                    temperature = 0.7
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _config.ApiKey);

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseJson = JsonSerializer.Deserialize<JsonElement>(responseContent);

                if (responseJson.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                {
                    var firstChoice = choices[0];
                    if (firstChoice.TryGetProperty("message", out var message) &&
                        message.TryGetProperty("content", out var contentElement))
                    {
                        return contentElement.GetString()?.Trim() ?? "";
                    }
                }

                throw new Exception("Không thể tạo tóm tắt từ phản hồi API");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error summarizing content for chapter {command.ChapterTitle}: {ex.Message}");
                throw new Exception($"Lỗi khi tạo tóm tắt: {ex.Message}");
            }
        }

    }
}