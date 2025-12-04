using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Staff,Admin")]
    public class StaffDashboardController : ControllerBase
    {
        private readonly IStaffDashboardService _staffDashboardService;

        public StaffDashboardController(IStaffDashboardService staffDashboardService)
        {
            _staffDashboardService = staffDashboardService;
        }

        /// <summary>
        /// Lấy thống kê tổng quan cho staff
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStaffStats()
        {
            try
            {
                var stats = await _staffDashboardService.GetStaffStatsAsync();
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy top sách bán chạy
        /// </summary>
        [HttpGet("top-books")]
        public async Task<IActionResult> GetTopBooks([FromQuery] int limit = 5)
        {
            try
            {
                var topBooks = await _staffDashboardService.GetTopBooksAsync(limit);
                return Ok(new { success = true, data = topBooks });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy top owners
        /// </summary>
        [HttpGet("top-owners")]
        public async Task<IActionResult> GetTopOwners([FromQuery] int limit = 5)
        {
            try
            {
                var topOwners = await _staffDashboardService.GetTopOwnersAsync(limit);
                return Ok(new { success = true, data = topOwners });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách sách chờ duyệt
        /// </summary>
        [HttpGet("pending-books")]
        public async Task<IActionResult> GetPendingBooks([FromQuery] int limit = 5)
        {
            try
            {
                var pendingBooks = await _staffDashboardService.GetPendingBooksAsync(limit);
                return Ok(new { success = true, data = pendingBooks });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách phản hồi gần đây
        /// </summary>
        [HttpGet("recent-feedbacks")]
        public async Task<IActionResult> GetRecentFeedbacks([FromQuery] int limit = 5)
        {
            try
            {
                var recentFeedbacks = await _staffDashboardService.GetRecentFeedbacksAsync(limit);
                return Ok(new { success = true, data = recentFeedbacks });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy toàn bộ dữ liệu dashboard
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetStaffDashboard()
        {
            try
            {
                var dashboard = await _staffDashboardService.GetStaffDashboardAsync();
                return Ok(new { success = true, data = dashboard });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}

