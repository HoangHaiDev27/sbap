using DataAccess;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using NAudio.Wave;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AudioConversionController : ControllerBase
    {
        private readonly IAudioService _audioService;
        private readonly IChapterService _chapterService;

        public AudioConversionController(IAudioService audioService, IChapterService chapterService)
        {
            _audioService = audioService;
            _chapterService = chapterService;
        }

        [HttpPost("generate/{chapterId}")]
        public async Task<IActionResult> GenerateChapterAudio(int chapterId, [FromQuery] string voiceName = "banmai", [FromQuery] double speed = 1.0)
        {
            try
            {
                var chapter = await _chapterService.GetChapterByIdAsync(chapterId);
                if (chapter == null)
                    return NotFound($"Chapter with ID {chapterId} not found.");

                if (string.IsNullOrEmpty(chapter.ChapterSoftUrl))
                    return BadRequest("This chapter does not have a ChapterSoftUrl.");

                // 🔹 Tải nội dung text từ ChapterSoftUrl (Cloudinary link của file .txt)
                using var httpClient = new HttpClient();
                var textContent = await httpClient.GetStringAsync(chapter.ChapterSoftUrl);

                if (string.IsNullOrWhiteSpace(textContent))
                    return BadRequest("The chapter text content is empty.");

                // 🔹 Gọi FPT AI TTS + upload Cloudinary (audio folder)
                var audioUrl = await _audioService.ConvertTextToSpeechAndUploadAsync(
                    textContent,
                    voiceName,
                    $"chapter_{chapter.ChapterId}",
                    speed
                );

                if (string.IsNullOrEmpty(audioUrl))
                    return StatusCode(500, "Failed to generate or upload audio.");

                // 🔹 Cập nhật thông tin audio vào Chapter
                chapter.ChapterAudioUrl = audioUrl;
                chapter.VoiceName = voiceName;

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

                    chapter.DurationSec = (int)Math.Round(durationSeconds);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[WARN] Không thể đọc thời lượng audio: {ex.Message}");
                }

                await _chapterService.UpdateChapterAsync(chapter);

                return Ok(new
                {
                    success = true,
                    message = "Audio generated and uploaded successfully.",
                    audioUrl,
                    voiceName,
                    durationSec = durationSeconds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
