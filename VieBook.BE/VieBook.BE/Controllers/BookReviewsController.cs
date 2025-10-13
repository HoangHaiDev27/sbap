using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookReviewsController : ControllerBase
    {
        private readonly IBookReviewService _reviewService;

        public BookReviewsController(IBookReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("book/{bookId:int}")]
        public async Task<ActionResult<IEnumerable<BookReviewDTO>>> GetByBook(int bookId, [FromQuery] byte? rating = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var items = await _reviewService.GetReviewsByBookIdAsync(bookId, rating, page, pageSize);
            return Ok(items);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized();

            var result = await _reviewService.CreateAsync(userId.Value, request.BookId, request.Rating, request.Comment);
            if (!result.Success) return BadRequest(new { message = result.Message });
            return Ok(result.Review);
        }

        [Authorize]
        [HttpPost("{reviewId:int}/reply")]
        public async Task<IActionResult> OwnerReply(int reviewId, [FromBody] OwnerReplyRequest request)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized();

            var res = await _reviewService.OwnerReplyAsync(userId.Value, reviewId, request.Reply);
            if (!res.Success) return BadRequest(new { message = res.Message });
            return Ok(true);
        }

        [Authorize]
        [HttpGet("can-review/{bookId:int}")]
        public async Task<IActionResult> CanReview(int bookId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized();

            var can = await _reviewService.CanReviewAsync(userId.Value, bookId);
            return Ok(new { canReview = can });
        }
    }

    public class CreateReviewRequest
    {
        public int BookId { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class OwnerReplyRequest
    {
        public string Reply { get; set; } = string.Empty;
    }
}


