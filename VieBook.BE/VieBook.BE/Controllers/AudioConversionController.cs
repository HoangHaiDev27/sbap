using DataAccess;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using NAudio.Wave;
using BusinessObject.Models;
using BusinessObject.Dtos;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AudioConversionController : ControllerBase
    {
        private readonly IAudioService _audioService;
        private readonly IChapterService _chapterService;
        private readonly IChapterAudioService _chapterAudioService;
        private readonly ISubscriptionService _subscriptionService;

        public AudioConversionController(IAudioService audioService, IChapterService chapterService, IChapterAudioService chapterAudioService, ISubscriptionService subscriptionService)
        {
            _audioService = audioService;
            _chapterService = chapterService;
            _chapterAudioService = chapterAudioService;
            _subscriptionService = subscriptionService;
        }

        [HttpPost("generate/{chapterId}")]
        public async Task<IActionResult> GenerateChapterAudio(int chapterId, [FromQuery] string voiceName = "banmai", [FromQuery] double speed = 1.0, [FromQuery] int userId = 1)
        {
            try
            {
                var chapter = await _chapterService.GetChapterByIdAsync(chapterId);
                if (chapter == null)
                    return NotFound($"Chapter with ID {chapterId} not found.");

                if (string.IsNullOrEmpty(chapter.ChapterSoftUrl))
                    return BadRequest("This chapter does not have a ChapterSoftUrl.");

                // Kiểm tra xem đã có audio với voice này chưa
                var existingAudio = await _chapterAudioService.GetChapterAudioByVoiceAsync(chapterId, voiceName);
                if (existingAudio != null)
                {
                    return BadRequest(new 
                    { 
                        success = false, 
                        message = $"Chương này đã có audio với giọng '{voiceName}'. Vui lòng chọn giọng khác.",
                        voiceName = voiceName
                    });
                }

                // Tải nội dung text từ ChapterSoftUrl (Cloudinary link của file .txt)
                using var httpClient = new HttpClient();
                var textContent = await httpClient.GetStringAsync(chapter.ChapterSoftUrl);

                if (string.IsNullOrWhiteSpace(textContent))
                    return BadRequest("The chapter text content is empty.");

                // Đếm số ký tự
                int characterCount = textContent.Length;

                // Kiểm tra subscription
                bool canCreate = await _subscriptionService.CanCreateAudioAsync(userId, characterCount);
                if (!canCreate)
                {
                    return BadRequest(new 
                    { 
                        success = false, 
                        message = "Không thể tạo audio. Vui lòng kiểm tra gói đăng kí của bạn (hết hạn hoặc không đủ lượt chuyển đổi).",
                        characterCount = characterCount,
                        requiredConversions = characterCount > 10000 ? 2 : 1
                    });
                }

                // Gọi FPT AI TTS + upload Cloudinary (audio folder)
                var audioUrl = await _audioService.ConvertTextToSpeechAndUploadAsync(
                    textContent,
                    voiceName,
                    $"chapter_{chapter.ChapterId}_{voiceName}",
                    speed
                );

                if (string.IsNullOrEmpty(audioUrl))
                    return StatusCode(500, "Failed to generate or upload audio.");

                double durationSeconds = 0;

                try
                {
                    using var audioClient = new HttpClient();
                    var audioBytes = await audioClient.GetByteArrayAsync(audioUrl);

                    using (var memoryStream = new MemoryStream(audioBytes))
                    using (var mp3Reader = new Mp3FileReader(memoryStream))
                    {
                        durationSeconds = mp3Reader.TotalTime.TotalSeconds;
                    }

                    // Nếu lần đầu không đọc được (duration = 0) thì thử lại sau 2 giây
                    if (durationSeconds <= 0.5)
                    {
                        Console.WriteLine("[WARN] Duration = 0, retrying in 2s...");
                        await Task.Delay(2000);

                        var retryBytes = await audioClient.GetByteArrayAsync(audioUrl);
                        using (var retryStream = new MemoryStream(retryBytes))
                        using (var retryReader = new Mp3FileReader(retryStream))
                        {
                            durationSeconds = retryReader.TotalTime.TotalSeconds;
                        }
                    }

                    // Nếu vẫn 0, thử dùng MediaFoundationReader (fallback)
                    if (durationSeconds <= 0.5)
                    {
                        try
                        {
                            var tempFile = Path.GetTempFileName();
                            await System.IO.File.WriteAllBytesAsync(tempFile, audioBytes);

                            using var reader = new MediaFoundationReader(tempFile);
                            durationSeconds = reader.TotalTime.TotalSeconds;

                            System.IO.File.Delete(tempFile);
                        }
                        catch (Exception innerEx)
                        {
                            Console.WriteLine($"[WARN] Fallback MediaFoundationReader failed: {innerEx.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WARN] Không thể đọc thời lượng audio: {ex.Message}");
                }

                // Lấy giá từ audio đã có trong cùng chapter (nếu có)
                decimal? priceSoft = null;
                var existingAudios = await _chapterAudioService.GetChapterAudiosByChapterIdAsync(chapterId);
                if (existingAudios != null && existingAudios.Any())
                {
                    priceSoft = existingAudios.First().PriceAudio;
                }

                // Lưu thông tin audio vào bảng ChapterAudio
                var chapterAudio = new ChapterAudio
                {
                    ChapterId = chapterId,
                    UserId = userId,
                    AudioLink = audioUrl,
                    DurationSec = (int)Math.Round(durationSeconds),
                    PriceAudio = priceSoft, // Copy giá từ audio đã có
                    VoiceName = voiceName,
                    CreatedAt = DateTime.UtcNow
                };

                await _chapterAudioService.AddChapterAudioAsync(chapterAudio);

                // Trừ conversions sau khi tạo thành công
                await _subscriptionService.DeductConversionAsync(userId, characterCount);

                return Ok(new
                {
                    success = true,
                    message = "Audio generated and uploaded successfully.",
                    audioUrl,
                    voiceName,
                    durationSec = durationSeconds,
                    audioId = chapterAudio.AudioId,
                    characterCount = characterCount,
                    conversionsDeducted = characterCount > 10000 ? 2 : 1
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("chapter/{chapterId}/audios")]
        public async Task<IActionResult> GetChapterAudios(int chapterId)
        {
            try
            {
                var chapterAudios = await _chapterAudioService.GetChapterAudiosByChapterIdAsync(chapterId);
                
                var audioDtos = chapterAudios.Select(ca => new ChapterAudioDTO
                {
                    AudioId = ca.AudioId,
                    ChapterId = ca.ChapterId,
                    UserId = ca.UserId,
                    AudioLink = ca.AudioLink,
                    DurationSec = ca.DurationSec,
                    PriceAudio = ca.PriceAudio,
                    CreatedAt = ca.CreatedAt,
                    VoiceName = ca.VoiceName ?? "unknown",
                    UserName = ca.User?.UserProfile?.FullName ?? ca.User?.Email ?? "Unknown"
                }).ToList();

                return Ok(new
                {
                    success = true,
                    data = audioDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("chapter/{chapterId}/latest-audio")]
        public async Task<IActionResult> GetLatestChapterAudio(int chapterId)
        {
            try
            {
                var chapterAudios = await _chapterAudioService.GetChapterAudiosByChapterIdAsync(chapterId);
                
                // Lấy audio mới nhất (đã sort theo CreatedAt descending trong DAO)
                var latestAudio = chapterAudios.FirstOrDefault();
                
                if (latestAudio == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No audio found for this chapter"
                    });
                }

                var audioDto = new ChapterAudioDTO
                {
                    AudioId = latestAudio.AudioId,
                    ChapterId = latestAudio.ChapterId,
                    UserId = latestAudio.UserId,
                    AudioLink = latestAudio.AudioLink,
                    DurationSec = latestAudio.DurationSec,
                    PriceAudio = latestAudio.PriceAudio,
                    CreatedAt = latestAudio.CreatedAt,
                    VoiceName = latestAudio.VoiceName ?? "unknown",
                    UserName = latestAudio.User?.UserProfile?.FullName ?? latestAudio.User?.Email ?? "Unknown"
                };

                return Ok(new
                {
                    success = true,
                    data = audioDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("book/{bookId}/chapter-audios")]
        public async Task<IActionResult> GetBookChapterAudios(int bookId)
        {
            try
            {
                // Lấy tất cả chapters của book để xác định thứ tự
                var allChapters = await _chapterService.GetChaptersByBookIdAsync(bookId);
                var orderedChapters = allChapters.OrderBy(c => c.ChapterId).ToList();
                
                // Lấy chapter audios
                var chapterAudios = await _chapterAudioService.GetChapterAudiosByBookIdAsync(bookId);
                
                // Group by ChapterId để lấy 1 audio đại diện cho mỗi chapter
                var groupedAudios = chapterAudios
                    .GroupBy(ca => ca.ChapterId)
                    .Select(g => g.First()) // Lấy audio đầu tiên (mới nhất do đã sort)
                    .ToList();

                // Tính số thứ tự thật của chapter trong sách
                var result = groupedAudios.Select(ca =>
                {
                    // Tìm index của chapter này trong tất cả chapters
                    var chapterIndex = orderedChapters.FindIndex(c => c.ChapterId == ca.ChapterId);
                    var chapterNumber = chapterIndex >= 0 ? chapterIndex + 1 : 0;
                    
                    return new
                    {
                        chapterId = ca.ChapterId,
                        chapterTitle = ca.Chapter?.ChapterTitle,
                        chapterNumber = chapterNumber, // Số thứ tự thật trong sách
                        audioId = ca.AudioId,
                        audioLink = ca.AudioLink,
                        durationSec = ca.DurationSec,
                        priceAudio = ca.PriceAudio,
                        voiceName = ca.VoiceName,
                        createdAt = ca.CreatedAt
                    };
                }).ToList();

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("audio/{audioId}")]
        public async Task<IActionResult> DeleteChapterAudio(int audioId)
        {
            try
            {
                var chapterAudio = await _chapterAudioService.GetChapterAudioByIdAsync(audioId);
                if (chapterAudio == null)
                    return NotFound($"Audio with ID {audioId} not found.");

                await _chapterAudioService.DeleteChapterAudioAsync(audioId);

                return Ok(new
                {
                    success = true,
                    message = "Audio deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("audio/{audioId}/price")]
        public async Task<IActionResult> UpdateAudioPrice(int audioId, [FromBody] UpdateAudioPriceRequest request)
        {
            try
            {
                var chapterAudio = await _chapterAudioService.GetChapterAudioByIdAsync(audioId);
                if (chapterAudio == null)
                    return NotFound($"Audio with ID {audioId} not found.");

                chapterAudio.PriceAudio = request.PriceAudio;
                await _chapterAudioService.UpdateChapterAudioAsync(chapterAudio);

                return Ok(new
                {
                    success = true,
                    message = "Audio price updated successfully.",
                    priceAudio = chapterAudio.PriceAudio
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("chapter/{chapterId}/price")]
        public async Task<IActionResult> UpdateChapterAudiosPrice(int chapterId, [FromBody] UpdateAudioPriceRequest request)
        {
            try
            {
                await _chapterAudioService.UpdateAllAudioPricesByChapterIdAsync(chapterId, request.PriceAudio);

                return Ok(new
                {
                    success = true,
                    message = "All audio prices updated successfully.",
                    priceAudio = request.PriceAudio
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("subscription/status")]
        public async Task<IActionResult> GetSubscriptionStatus([FromQuery] int userId)
        {
            try
            {
                var subscription = await _subscriptionService.GetActiveSubscriptionByUserIdAsync(userId);
                
                if (subscription == null)
                {
                    return Ok(new
                    {
                        success = false,
                        message = "No active subscription found",
                        hasSubscription = false
                    });
                }

                return Ok(new
                {
                    success = true,
                    hasSubscription = true,
                    subscription = new
                    {
                        subscriptionId = subscription.SubscriptionId,
                        status = subscription.Status,
                        startAt = subscription.StartAt,
                        endAt = subscription.EndAt,
                        remainingConversions = subscription.RemainingConversions,
                        planName = subscription.Plan?.Name
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string ExtractVoiceNameFromUrl(string audioUrl)
        {
            if (string.IsNullOrEmpty(audioUrl))
                return "unknown";

            // Tìm voice name từ URL, ví dụ: chapter_123_banmai.mp3
            var fileName = Path.GetFileNameWithoutExtension(audioUrl);
            var parts = fileName.Split('_');
            
            if (parts.Length >= 3)
            {
                return parts[2]; // Lấy phần thứ 3 (voice name)
            }
            
            return "unknown";
        }
    }
}
