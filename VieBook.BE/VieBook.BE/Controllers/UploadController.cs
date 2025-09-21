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
    }
}
