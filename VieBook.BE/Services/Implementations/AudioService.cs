using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Services.Interfaces;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Text.Json;

namespace Services.Implementations
{
    public class AudioService : IAudioService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly CloudinaryService _cloudinaryService;
        private readonly string _apiKey;
        private readonly string _baseUrl;

        public AudioService(IHttpClientFactory httpClientFactory, CloudinaryService cloudinaryService, IConfiguration config)
        {
            _httpClientFactory = httpClientFactory;
            _cloudinaryService = cloudinaryService;

            _apiKey = config["FptAiSettings:ApiKey"];
            _baseUrl = config["FptAiSettings:BaseUrl"];
        }

        public async Task<string> ConvertTextToSpeechAndUploadAsync(string text, string voiceName, string fileName, double speed)
        {
            var client = _httpClientFactory.CreateClient();
            // Cấu hình timeout 10 phút cho HttpClient (600 giây)
            client.Timeout = TimeSpan.FromMinutes(10);
            // Note: api_key sẽ được thêm vào từng request riêng biệt

            const int chunkSize = 1000;
            var chunks = SplitTextIntoChunks(text, chunkSize);
            var audioParts = new List<byte[]>();

            Console.WriteLine($"[INFO] Converting {chunks.Count} chunks using voice '{voiceName}'...");

            int chunkIndex = 0;

            foreach (var chunk in chunks)
            {
                chunkIndex++;
                Console.WriteLine($"\n======================");
                Console.WriteLine($"[INFO] 🔹 Processing chunk {chunkIndex}/{chunks.Count} (length: {chunk.Length})");
                Console.WriteLine($"[INFO] Text preview: {chunk.Substring(0, Math.Min(60, chunk.Length))}...");
                Console.WriteLine("======================\n");

                try
                {
                    // FPT AI TTS v5 yêu cầu:
                    // - Headers: api_key, voice, speed, format
                    // - Body: plain text (không phải JSON)
                    var cleanedText = CleanText(chunk, chunkSize);
                    
                    // Tạo request với headers đúng format
                    var request = new HttpRequestMessage(HttpMethod.Post, _baseUrl);
                    request.Headers.Add("api_key", _apiKey);
                    request.Headers.Add("voice", voiceName);
                    request.Headers.Add("speed", speed.ToString());
                    request.Headers.Add("format", "mp3");
                    
                    // Body là plain text, không phải JSON
                    request.Content = new StringContent(cleanedText, new UTF8Encoding(false), "text/plain");

                    Console.WriteLine($"[DEBUG] Request headers: api_key=***, voice={voiceName}, speed={speed}, format=mp3");
                    Console.WriteLine($"[DEBUG] Request body (first 100 chars): {cleanedText.Substring(0, Math.Min(100, cleanedText.Length))}...");

                    var response = await client.SendAsync(request);
                    var resultJson = await response.Content.ReadAsStringAsync();

                    Console.WriteLine($"[DEBUG] FPT Response for chunk {chunkIndex}: {resultJson}");

                    if (!response.IsSuccessStatusCode)
                        throw new Exception($"FPT.AI TTS failed: {response.StatusCode} | Response: {resultJson}");

                    var jsonDoc = JsonDocument.Parse(resultJson);
                    var asyncUrl = jsonDoc.RootElement.GetProperty("async").GetString();

                    if (string.IsNullOrEmpty(asyncUrl))
                        throw new Exception($"Chunk {chunkIndex}: FPT.AI did not return async URL.");

                    // Chờ khi file audio sẵn sàng
                    var bytes = await DownloadAudioWhenReady(client, asyncUrl);
                    audioParts.Add(bytes);

                    Console.WriteLine($"[SUCCESS] Chunk {chunkIndex}/{chunks.Count} done (bytes: {bytes.Length})");

                    await Task.Delay(25000); // đợi giữa các chunk
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Chunk {chunkIndex}/{chunks.Count} failed: {ex.Message}");
                }
            }

            // Gộp các file audio lại (đơn giản: nối byte)
            var mergedStream = new MemoryStream();
            foreach (var part in audioParts)
                mergedStream.Write(part, 0, part.Length);
            mergedStream.Position = 0;

            // Upload lên Cloudinary
            var uploadUrl = await _cloudinaryService.UploadAudioAsync(mergedStream, $"{fileName}.mp3");

            Console.WriteLine($"[SUCCESS] Uploaded final audio: {uploadUrl}");
            return uploadUrl;
        }

        // Kiểm tra khi nào FPT audio sẵn sàng
        private async Task<byte[]> DownloadAudioWhenReady(HttpClient client, string asyncUrl)
        {
            for (int i = 0; i < 90; i++)
            {
                try
                {
                    // Thử tải file
                    var data = await client.GetByteArrayAsync(asyncUrl);

                    // Nếu có dữ liệu hợp lệ => thành công
                    if (data.Length > 1000)
                    {
                        Console.WriteLine($"[SUCCESS] Audio ready after {i * 2}s");
                        return data;
                    }
                }
                catch (HttpRequestException ex)
                {
                    // FPT.AI vẫn đang xử lý
                    Console.WriteLine($"[WAIT] Audio not ready ({i + 1}/90): {ex.Message}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] Unexpected: {ex.Message}");
                }

                await Task.Delay(2000); // chờ 2 giây trước khi thử lại
            }

            throw new Exception("FPT.AI audio not ready after 3 minutes");
        }

        // Chia nhỏ text để FPT xử lý
        private List<string> SplitTextIntoChunks(string text, int maxLength)
        {
            var chunks = new List<string>();
            if (string.IsNullOrWhiteSpace(text))
                return chunks;

            // Làm sạch cơ bản
            text = text.Replace("\r", " ").Replace("\n", " ");
            text = System.Text.RegularExpressions.Regex.Replace(text, @"\s{2,}", " ").Trim();

            // Chuẩn hóa dấu câu Unicode
            text = text
                .Replace("…", ".")
                .Replace("．", ".")
                .Replace("。", ".")
                .Replace("‧", ".")
                .Replace("•", ".")
                .Replace("?", "?")
                .Replace("!", "!");

            // Regex này tách câu dù là khoảng trắng hay xuống dòng
            var sentences = System.Text.RegularExpressions.Regex.Split(
                text,
                @"(?<=[\.!?])(?:\s+|$)"
            );

            var current = new StringBuilder();

            foreach (var sentence in sentences)
            {
                if (string.IsNullOrWhiteSpace(sentence)) continue;

                if ((current.Length + sentence.Length + 1) > maxLength)
                {
                    chunks.Add(current.ToString().Trim());
                    current.Clear();
                }

                current.Append(sentence).Append(" ");
            }

            if (current.Length > 0)
                chunks.Add(current.ToString().Trim());

            // Hợp nhất các chunk ngắn lại
            for (int i = 1; i < chunks.Count; i++)
            {
                if (chunks[i].Length < 400 && chunks[i - 1].Length + chunks[i].Length < maxLength)
                {
                    chunks[i - 1] += " " + chunks[i];
                    chunks.RemoveAt(i);
                    i--;
                }
            }

            Console.WriteLine($"[INFO] Split into {chunks.Count} chunks ({string.Join(" | ", chunks.Select(c => c.Length.ToString()))})");
            return chunks;
        }

        // Làm sạch text gửi lên FPT
        private string CleanText(string text, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            text = text.Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
            text = System.Text.RegularExpressions.Regex.Replace(text, @"\s{2,}", " ");
            text = text.Trim();

            if (text.Length > maxLength)
                text = text.Substring(0, maxLength);

            return text;
        }
    }
}
