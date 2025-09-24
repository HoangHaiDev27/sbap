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
        public async Task<IActionResult> UploadImage(IFormFile file)
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
    }
}
