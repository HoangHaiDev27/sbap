using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.ComponentModel.DataAnnotations;
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
                // Validation
                if (request == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return BadRequest(new { message = "Nội dung báo cáo không được để trống" });
                }

                if (request.Content.Trim().Length < 10)
                {
                    return BadRequest(new { message = "Nội dung báo cáo phải có ít nhất 10 ký tự" });
                }

                if (request.Content.Trim().Length > 2000)
                {
                    return BadRequest(new { message = "Nội dung báo cáo không được vượt quá 2000 ký tự" });
                }

                if (request.TargetId <= 0)
                {
                    return BadRequest(new { message = "ID sách không hợp lệ" });
                }

                // Lấy userId từ JWT token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "Không thể xác định người dùng" });
                }

                // Gửi feedback thông qua service
                var feedback = await _userFeedbackService.SubmitFeedbackAsync(
                    userId, 
                    request.Content.Trim(), 
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
        [Required(ErrorMessage = "ID sách là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "ID sách phải lớn hơn 0")]
        public int TargetId { get; set; }
        
        [Required(ErrorMessage = "Nội dung báo cáo là bắt buộc")]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "Nội dung báo cáo phải có từ 10 đến 2000 ký tự")]
        public string Content { get; set; } = string.Empty;
    }
}
