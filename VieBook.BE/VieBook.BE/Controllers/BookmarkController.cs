using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookmarkController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarkController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserBookmarks()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var bookmarks = await _bookmarkService.GetUserBookmarksAsync(userId.Value);
                return Ok(bookmarks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("chapter/{chapterId}")]
        public async Task<IActionResult> GetBookmarkByChapter(int chapterId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var bookmark = await _bookmarkService.GetBookmarkByUserAndChapterAsync(userId.Value, chapterId);
                return Ok(bookmark);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateBookmark([FromBody] CreateBookmarkDTO bookmarkDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var bookmark = await _bookmarkService.CreateOrUpdateBookmarkAsync(userId.Value, bookmarkDto);
                return Ok(bookmark);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{bookmarkId}")]
        public async Task<IActionResult> DeleteBookmark(int bookmarkId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _bookmarkService.DeleteBookmarkAsync(userId.Value, bookmarkId);
                if (result)
                {
                    return Ok(new { message = "Bookmark deleted successfully" });
                }
                else
                {
                    return NotFound(new { message = "Bookmark not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("chapter/{chapterId}")]
        public async Task<IActionResult> DeleteBookmarkByChapter(int chapterId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _bookmarkService.DeleteBookmarkByChapterAsync(userId.Value, chapterId);
                if (result)
                {
                    return Ok(new { message = "Bookmark deleted successfully" });
                }
                else
                {
                    return NotFound(new { message = "Bookmark not found" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
