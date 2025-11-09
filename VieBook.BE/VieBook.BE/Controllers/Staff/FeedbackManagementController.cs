using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VieBook.BE.Controllers.Staff
{
    [ApiController]
    [Route("api/staff/[controller]")]
    public class FeedbackManagementController : ControllerBase
    {
        private readonly IUserFeedbackService _userFeedbackService;
        private readonly IBookReviewService _bookReviewService;

        public FeedbackManagementController(
            IUserFeedbackService userFeedbackService,
            IBookReviewService bookReviewService)
        {
            _userFeedbackService = userFeedbackService;
            _bookReviewService = bookReviewService;
        }

        // GET: api/staff/feedbackmanagement/userfeedback
        [HttpGet("userfeedback")]
        public async Task<ActionResult> GetAllUserFeedbacks(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? bookId = null)
        {
            try
            {
                var (feedbacks, totalCount) = await _userFeedbackService.GetAllForStaffPagedAsync(page, pageSize, searchTerm, bookId);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return Ok(new
                {
                    data = feedbacks,
                    totalCount,
                    page,
                    pageSize,
                    totalPages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách feedback", error = ex.Message });
            }
        }

        // GET: api/staff/feedbackmanagement/bookreviews
        [HttpGet("bookreviews")]
        public async Task<ActionResult> GetAllBookReviews(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? bookId = null)
        {
            try
            {
                var (reviews, totalCount) = await _bookReviewService.GetAllForStaffPagedAsync(page, pageSize, searchTerm, bookId);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                return Ok(new
                {
                    data = reviews,
                    totalCount,
                    page,
                    pageSize,
                    totalPages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách đánh giá", error = ex.Message });
            }
        }

        // DELETE: api/staff/feedbackmanagement/bookreviews/{reviewId}
        [HttpDelete("bookreviews/{reviewId}")]
        public async Task<ActionResult> DeleteBookReview(int reviewId)
        {
            try
            {
                var success = await _bookReviewService.DeleteAsync(reviewId);
                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy đánh giá cần xóa" });
                }
                return Ok(new { message = "Xóa đánh giá thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa đánh giá", error = ex.Message });
            }
        }

        // DELETE: api/staff/feedbackmanagement/userfeedback/{feedbackId}
        [HttpDelete("userfeedback/{feedbackId}")]
        public async Task<ActionResult> DeleteUserFeedback(int feedbackId)
        {
            try
            {
                // Có thể lấy staffId từ token nếu cần, hiện tại để null
                var success = await _userFeedbackService.DeleteAsync(feedbackId, null);
                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy feedback cần xóa" });
                }
                return Ok(new { message = "Xóa feedback thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa feedback", error = ex.Message });
            }
        }

        // GET: api/staff/feedbackmanagement/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetFeedbackStats(
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? bookId = null)
        {
            try
            {
                var complimentsCount = await _bookReviewService.GetTotalCountForStaffAsync(searchTerm, bookId);
                var bugsCount = await _userFeedbackService.GetTotalCountForStaffAsync(searchTerm, bookId);
                var totalCount = complimentsCount + bugsCount;

                return Ok(new
                {
                    total = totalCount,
                    compliments = complimentsCount,
                    bugs = bugsCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thống kê feedback", error = ex.Message });
            }
        }
    }
}

