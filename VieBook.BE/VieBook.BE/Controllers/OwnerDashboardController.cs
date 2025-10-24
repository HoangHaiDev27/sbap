using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OwnerDashboardController : ControllerBase
    {
        private readonly IOwnerDashboardService _ownerDashboardService;

        public OwnerDashboardController(IOwnerDashboardService ownerDashboardService)
        {
            _ownerDashboardService = ownerDashboardService;
        }

        /// <summary>
        /// Lấy thống kê tổng quan của owner
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetOwnerStats()
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var stats = await _ownerDashboardService.GetOwnerStatsAsync(ownerId.Value);
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy doanh thu theo thể loại
        /// </summary>
        [HttpGet("revenue-by-category")]
        public async Task<IActionResult> GetRevenueByCategory()
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var revenueByCategory = await _ownerDashboardService.GetRevenueByCategoryAsync(ownerId.Value);
                return Ok(new { success = true, data = revenueByCategory });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy dữ liệu bán hàng theo tháng
        /// </summary>
        [HttpGet("monthly-sales")]
        public async Task<IActionResult> GetMonthlySales([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var monthlySales = await _ownerDashboardService.GetMonthlySalesAsync(ownerId.Value, startDate, endDate);
                return Ok(new { success = true, data = monthlySales });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy đơn hàng gần nhất
        /// </summary>
        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int limit = 10)
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var recentOrders = await _ownerDashboardService.GetRecentOrdersAsync(ownerId.Value, limit);
                return Ok(new { success = true, data = recentOrders });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy top sách bán chạy
        /// </summary>
        [HttpGet("best-sellers")]
        public async Task<IActionResult> GetBestSellers([FromQuery] int limit = 5)
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var bestSellers = await _ownerDashboardService.GetBestSellersAsync(ownerId.Value, limit);
                return Ok(new { success = true, data = bestSellers });
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
        public async Task<IActionResult> GetOwnerDashboard()
        {
            try
            {
                var ownerId = GetCurrentOwnerId();
                if (ownerId == null)
                {
                    return Unauthorized("Owner ID not found");
                }

                var dashboard = await _ownerDashboardService.GetOwnerDashboardAsync(ownerId.Value);
                return Ok(new { success = true, data = dashboard });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        private int? GetCurrentOwnerId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}

