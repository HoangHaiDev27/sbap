using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReadingStatsController : ControllerBase
    {
        private readonly IReadingStatsService _readingStatsService;

        public ReadingStatsController(IReadingStatsService readingStatsService)
        {
            _readingStatsService = readingStatsService;
        }

        /// <summary>
        /// Lấy số sách đã đọc của user
        /// </summary>
        [HttpGet("user/{userId}/books-read")]
        public async Task<ActionResult<int>> GetBooksReadCount(int userId)
        {
            try
            {
                var count = await _readingStatsService.GetBooksReadCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetBooksReadCount: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi lấy số sách đã đọc");
            }
        }

        /// <summary>
        /// Lấy số sách đã mua của user
        /// </summary>
        [HttpGet("user/{userId}/books-purchased")]
        public async Task<ActionResult<int>> GetBooksPurchasedCount(int userId)
        {
            try
            {
                var count = await _readingStatsService.GetBooksPurchasedCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetBooksPurchasedCount: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi lấy số sách đã mua");
            }
        }

        /// <summary>
        /// Lấy số sách yêu thích của user
        /// </summary>
        [HttpGet("user/{userId}/favorites")]
        public async Task<ActionResult<int>> GetFavoritesCount(int userId)
        {
            try
            {
                var count = await _readingStatsService.GetFavoritesCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetFavoritesCount: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi lấy số sách yêu thích");
            }
        }

        /// <summary>
        /// Lấy số sách đã nghe của user
        /// </summary>
        [HttpGet("user/{userId}/books-listened")]
        public async Task<ActionResult<int>> GetBooksListenedCount(int userId)
        {
            try
            {
                var count = await _readingStatsService.GetBooksListenedCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetBooksListenedCount: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi lấy số sách đã nghe");
            }
        }
    }
}
