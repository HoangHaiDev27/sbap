using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/posts/{postId}/reactions")]
    public class PostReactionController : ControllerBase
    {
        private readonly IPostReactionService _postReactionService;

        public PostReactionController(IPostReactionService postReactionService)
        {
            _postReactionService = postReactionService;
        }

        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<IActionResult> GetReactions(long postId)
        {
            try
            {
                var reactions = await _postReactionService.GetByPostIdAsync(postId);
                return Ok(reactions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("count")]
        public async Task<IActionResult> GetReactionCount(long postId)
        {
            try
            {
                var count = await _postReactionService.GetReactionCountByPostIdAsync(postId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    
        [Authorize(Roles = "Customer")]
        [HttpGet("user")]
        public async Task<IActionResult> GetUserReaction(long postId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var reaction = await _postReactionService.GetByPostAndUserAsync(postId, userId.Value);
                return Ok(reaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> ToggleReaction(long postId, [FromBody] CreatePostReactionDTO createDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            if (createDto.PostId != postId)
                return BadRequest(new { message = "PostId mismatch" });

            try
            {
                var reaction = await _postReactionService.ToggleReactionAsync(createDto, userId.Value);
                if (reaction == null)
                    return Ok(new { message = "Reaction removed", removed = true });
                return Ok(reaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete]
        public async Task<IActionResult> DeleteReaction(long postId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var deleted = await _postReactionService.DeleteReactionAsync(postId, userId.Value);
                if (deleted)
                    return Ok(new { message = "Reaction deleted" });
                return NotFound(new { message = "Reaction not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}


