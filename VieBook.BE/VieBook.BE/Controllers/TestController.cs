using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Configuration;

namespace VieBook.BE.Controllers
{
    /// <summary>
    /// Controller dùng để test các background services
    /// ⚠️ Chỉ dùng trong môi trường development, xóa hoặc bảo vệ trong production
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<TestController> _logger;

        public TestController(
            IEmailService emailService, 
            ILogger<TestController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        /// <summary>
        /// Test gửi email thông báo promotion cho users có sách trong wishlist
        /// Gọi API này để test ngay thay vì chờ background job chạy lúc 7:00 AM
        /// </summary>
        /// <param name="frontendUrl">URL frontend (nếu không truyền sẽ lấy từ ApiConfiguration)</param>
        [HttpPost("wishlist-promotion")]
        public async Task<IActionResult> TestWishlistPromotion([FromQuery] string? frontendUrl = null)
        {
            try
            {
                // Dùng URL từ query hoặc lấy từ ApiConfiguration
                var url = frontendUrl ?? ApiConfiguration.FRONTEND_URL;
                
                _logger.LogInformation("🧪 Manual trigger: Testing wishlist promotion email with frontend URL: {url}", url);
                
                await _emailService.ProcessWishlistPromotionsAsync(url);
                
                return Ok(new { 
                    success = true, 
                    message = "Wishlist promotion job executed successfully. Check logs for details.",
                    frontendUrl = url
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in test wishlist promotion");
                return StatusCode(500, new { 
                    success = false, 
                    message = ex.Message 
                });
            }
        }
    }
}
