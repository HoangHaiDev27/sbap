using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/posts/{postId}/comments")]
    public class PostCommentController : ControllerBase
    {
        private readonly IPostCommentService _postCommentService;

        public PostCommentController(IPostCommentService postCommentService)
        {
            _postCommentService = postCommentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetComments(long postId)
        {
            try
            {
                var comments = await _postCommentService.GetByPostIdAsync(postId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetCommentCount(long postId)
        {
            try
            {
                var count = await _postCommentService.GetCommentCountByPostIdAsync(postId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{commentId}")]
        public async Task<IActionResult> GetCommentById(long postId, long commentId)
        {
            try
            {
                var comment = await _postCommentService.GetByIdAsync(commentId);
                if (comment == null)
                    return NotFound(new { message = "Comment not found" });
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment(long postId, [FromBody] CreatePostCommentDTO createDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            if (createDto.PostId != postId)
                return BadRequest(new { message = "PostId mismatch" });

            try
            {
                var comment = await _postCommentService.CreateAsync(createDto, userId.Value);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{commentId}")]
        public async Task<IActionResult> UpdateComment(long postId, long commentId, [FromBody] UpdatePostCommentDTO updateDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var comment = await _postCommentService.UpdateAsync(commentId, updateDto, userId.Value);
                return Ok(comment);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(long postId, long commentId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var deleted = await _postCommentService.DeleteAsync(commentId, userId.Value);
                if (deleted)
                    return Ok(new { message = "Comment deleted" });
                return NotFound(new { message = "Comment not found" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}


