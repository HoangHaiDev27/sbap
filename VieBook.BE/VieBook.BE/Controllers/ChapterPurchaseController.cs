using BusinessObject.Dtos;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChapterPurchaseController : ControllerBase
    {
        private readonly IChapterPurchaseService _chapterPurchaseService;

        public ChapterPurchaseController(IChapterPurchaseService chapterPurchaseService)
        {
            _chapterPurchaseService = chapterPurchaseService;
        }

        [HttpPost("purchase")]
        public async Task<IActionResult> PurchaseChapters([FromBody] ChapterPurchaseRequestDTO request)
        {
            try
            {
                // Lấy userId từ JWT token
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                // Validate request
                if (request.ChapterIds == null || request.ChapterIds.Count == 0)
                {
                    return BadRequest(new Response(-1, "ChapterIds is required", null));
                }

                if (request.BookId <= 0)
                {
                    return BadRequest(new Response(-1, "Valid BookId is required", null));
                }

                // Process purchase
                var result = await _chapterPurchaseService.PurchaseChaptersAsync(userId.Value, request);

                if (result.Success)
                {
                    return Ok(new Response(0, result.Message, result));
                }
                else
                {
                    return BadRequest(new Response(-1, result.Message, null));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(-1, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("check-ownership/{chapterId}")]
        public async Task<IActionResult> CheckChapterOwnership(int chapterId)
        {
            try
            {
                // Lấy userId từ JWT token
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var isOwned = await _chapterPurchaseService.CheckChapterOwnershipAsync(userId.Value, chapterId);

                return Ok(new Response(0, "Success", new { isOwned }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(-1, $"Internal server error: {ex.Message}", null));
            }
        }

        [HttpGet("my-purchases")]
        public async Task<IActionResult> GetMyPurchases()
        {
            try
            {
                // Lấy userId từ JWT token
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var purchases = await _chapterPurchaseService.GetUserPurchasedChaptersAsync(userId.Value);

                return Ok(new Response(0, "Success", purchases));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new Response(-1, $"Internal server error: {ex.Message}", null));
            }
        }
    }
}
