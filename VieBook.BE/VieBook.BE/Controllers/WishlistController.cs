using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet("{bookId:int}/check")]
        public async Task<IActionResult> Check(int bookId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized(new { message = "User not authenticated" });

            var exists = await _wishlistService.IsInWishlistAsync(userId.Value, bookId);
            return Ok(new { isWishlisted = exists });
        }

        [HttpPost("{bookId:int}")]
        public async Task<IActionResult> Add(int bookId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized(new { message = "User not authenticated" });

            await _wishlistService.AddAsync(userId.Value, bookId);
            return Ok(new { success = true });
        }

        [HttpDelete("{bookId:int}")]
        public async Task<IActionResult> Remove(int bookId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized(new { message = "User not authenticated" });

            var removed = await _wishlistService.RemoveAsync(userId.Value, bookId);
            if (!removed) return NotFound(new { message = "Not in wishlist" });
            return Ok(new { success = true });
        }

        [HttpPost("{bookId:int}/toggle")]
        public async Task<IActionResult> Toggle(int bookId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized(new { message = "User not authenticated" });

            var nowWishlisted = await _wishlistService.ToggleAsync(userId.Value, bookId);
            return Ok(new { isWishlisted = nowWishlisted });
        }

        [HttpGet("me")]
        public async Task<IActionResult> MyWishlist()
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue) return Unauthorized(new { message = "User not authenticated" });

            var books = await _wishlistService.GetUserWishlistBooksAsync(userId.Value);
            return Ok(books);
        }
    }
}


