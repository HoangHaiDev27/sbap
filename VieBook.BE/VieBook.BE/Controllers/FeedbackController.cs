using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IUserFeedbackService _userFeedbackService;

        public FeedbackController(IUserFeedbackService userFeedbackService)
        {
            _userFeedbackService = userFeedbackService;
        }

        [HttpPost("book-report")]
        [Authorize]
        public async Task<ActionResult> SubmitBookReport([FromBody] BookReportRequest request)
        {
            try
            {
                // Lấy userId từ JWT token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                // Gửi feedback thông qua service
                var feedback = await _userFeedbackService.SubmitFeedbackAsync(
                    userId, 
                    request.Content, 
                    "Book", 
                    request.TargetId
                );

                return Ok(new { 
                    message = "Báo cáo đã được gửi thành công",
                    feedbackId = feedback.FeedbackId 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi báo cáo", error = ex.Message });
            }
        }

    }

    public class BookReportRequest
    {
        public int TargetId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
