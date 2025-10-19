using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class OrderItemController : ControllerBase
    {
        private readonly IOrderItemService _orderItemService;

        public OrderItemController(IOrderItemService orderItemService)
        {
            _orderItemService = orderItemService;
        }

        /// <summary>
        /// Lấy lịch sử mua sách của user
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <param name="page">Trang hiện tại (mặc định 1)</param>
        /// <param name="pageSize">Số lượng item mỗi trang (mặc định 6)</param>
        /// <param name="timeFilter">Bộ lọc theo thời gian (all, today, week, month, year)</param>
        /// <param name="sortBy">Sắp xếp theo (recent, oldest, name, price_high, price_low)</param>
        /// <returns>Danh sách sách đã mua</returns>
        [HttpGet("purchased-books/{userId}")]
        public async Task<IActionResult> GetPurchasedBooks(
            int userId,
            [FromQuery] string timeFilter = "all",
            [FromQuery] string sortBy = "recent")
        {
            try
            {
                // Get all books without pagination
                var result = await _orderItemService.GetAllPurchasedBooksAsync(userId, timeFilter, sortBy);
                
                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Lấy danh sách sách đã mua thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết một order item
        /// </summary>
        /// <param name="orderItemId">ID của order item</param>
        /// <returns>Chi tiết order item</returns>
        [HttpGet("{orderItemId}")]
        public async Task<IActionResult> GetOrderItem(long orderItemId)
        {
            try
            {
                var result = await _orderItemService.GetOrderItemByIdAsync(orderItemId);
                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy order item"
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Lấy chi tiết order item thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy danh sách chapter đã mua của một sách
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <param name="bookId">ID của sách</param>
        /// <returns>Danh sách chapter đã mua</returns>
        [HttpGet("purchased-chapters/{userId}/{bookId}")]
        public async Task<IActionResult> GetPurchasedChapters(int userId, int bookId)
        {
            try
            {
                var result = await _orderItemService.GetPurchasedChaptersByBookAsync(userId, bookId);
                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Lấy danh sách chapter đã mua thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
