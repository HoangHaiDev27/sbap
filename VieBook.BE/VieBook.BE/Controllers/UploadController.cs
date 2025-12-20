using BusinessObject.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Implementations;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly CloudinaryService _cloudinaryService;

        public UploadController(CloudinaryService cloudinaryService)
        {
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("bookImage")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            var url = await _cloudinaryService.UploadBookImageAsync(file);
            if (url == null) return BadRequest("Upload thất bại");

            return Ok(new { imageUrl = url });
        }

        [HttpDelete("bookImage")]
        public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return BadRequest("imageUrl is required");

            var result = await _cloudinaryService.DeleteImageAsync(imageUrl);

            if (!result)
                return NotFound("Không tìm thấy hoặc xóa thất bại");

            return Ok(new { message = "Đã xóa ảnh thành công" });
        }
        [HttpPost("avatarImage")]
        public async Task<IActionResult> UploadAvaterImage([FromForm] IFormFile file)
        {
            var url = await _cloudinaryService.UploadAvatarImageAsync(file);
            if (url == null) return BadRequest("Upload thất bại");

            return Ok(new { imageUrl = url });
        }
        [HttpPost("uploadChapterFile")]
        public async Task<IActionResult> UploadChapter([FromBody] ChapterUploadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest(new { message = "Nội dung chương trống" });

            var fileName = $"{dto.BookId}_{dto.Title}.txt";
            var url = await _cloudinaryService.UploadTextAsync(dto.Content, fileName);

            if (url == null) return StatusCode(500, new { message = "Upload thất bại" });

            return Ok(new { url });
        }

        [HttpPost("certificate")]
        public async Task<IActionResult> UploadCertificate([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            // Validate file type (image or PDF)
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP) hoặc PDF" });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "File không được vượt quá 10MB" });

            var url = await _cloudinaryService.UploadCertificateAsync(file);
            if (url == null) return StatusCode(500, new { message = "Upload giấy chứng nhận thất bại" });

            return Ok(new { fileUrl = url, imageUrl = url }); // Return both for compatibility
        }

        [HttpPost("postImage")]
        public async Task<IActionResult> UploadPostImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            try
            {
                var url = await _cloudinaryService.UploadPostImageAsync(file);
                if (url == null) return StatusCode(500, new { message = "Upload ảnh bài viết thất bại" });

                return Ok(new { imageUrl = url });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi upload ảnh: {ex.Message}" });
            }
        }

        [HttpPost("postVideo")]
        [RequestSizeLimit(100 * 1024 * 1024)] // 100 MB
        [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)] // 100 MB
        public async Task<IActionResult> UploadPostVideo([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            try
            {
                var url = await _cloudinaryService.UploadPostVideoAsync(file);
                if (url == null) return StatusCode(500, new { message = "Upload video bài viết thất bại" });

                return Ok(new { videoUrl = url });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi khi upload video: {ex.Message}" });
            }
        }
    }
}
