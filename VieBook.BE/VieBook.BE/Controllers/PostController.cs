using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/posts")]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly IBookOfferService _bookOfferService;
        private readonly IBookClaimService _bookClaimService;

        public PostController(IPostService postService, IBookOfferService bookOfferService, IBookClaimService bookClaimService)
        {
            _postService = postService;
            _bookOfferService = bookOfferService;
            _bookClaimService = bookClaimService;
        }

        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] string? postType, [FromQuery] string? searchQuery, [FromQuery] string? filter, [FromQuery] string? tag, [FromQuery] int? authorId, [FromQuery] string? subFilter)
        {
            try
            {
                // If filter is "registered", get posts that user has claimed
                if (filter == "registered")
                {
                    var userId = UserHelper.GetCurrentUserId(HttpContext);
                    if (!userId.HasValue)
                        return Unauthorized(new { message = "Non authentifié" });
                    
                    var posts = await _postService.GetPostsByClaimedUserAsync(userId.Value);
                    return Ok(posts);
                }

                // If filter is "my-posts", get posts by current user
                if (filter == "my-posts")
                {
                    var userId = UserHelper.GetCurrentUserId(HttpContext);
                    if (!userId.HasValue)
                        return Unauthorized(new { message = "Non authentifié" });
                    
                    // subFilter: "all" or "hidden"
                    var includeHidden = subFilter == "hidden";
                    var posts = await _postService.GetPostsByAuthorIdAsync(userId.Value, includeHidden);
                    return Ok(posts);
                }

                var allPosts = await _postService.GetPostsAsync(postType, searchQuery, tag, authorId);
                return Ok(allPosts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var post = await _postService.GetByIdAsync(id);
            if (post == null)
                return NotFound(new { message = "Post not found" });
            return Ok(post);
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostDTO createDto)
        {
            if (createDto == null)
            {
                return BadRequest(new { message = "Request body is required" });
            }

            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var post = await _postService.CreateAsync(createDto, userId.Value);
                return Ok(post);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] CreatePostDTO updateDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var post = await _postService.UpdateAsync(id, updateDto, userId.Value);
                return Ok(post);
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

        [Authorize(Roles = "Customer")]
        [HttpPut("{id}/visibility")]
        public async Task<IActionResult> UpdateVisibility(long id, [FromBody] UpdateVisibilityDTO updateDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            if (updateDto == null || string.IsNullOrEmpty(updateDto.Visibility))
                return BadRequest(new { message = "Visibility is required" });

            try
            {
                var post = await _postService.UpdateVisibilityAsync(id, updateDto.Visibility, userId.Value);
                return Ok(post);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var result = await _postService.DeleteAsync(id, userId.Value);
                if (result)
                    return Ok(new { message = "Post supprimé" });
                return NotFound(new { message = "Post non trouvé" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("offers/active")]
        public async Task<IActionResult> GetActiveOffers()
        {
            var offers = await _bookOfferService.GetActiveOffersAsync();
            return Ok(offers);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("offers/owner/{ownerId}")]
        public async Task<IActionResult> GetOffersByOwnerId(int ownerId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue || userId.Value != ownerId)
                return Unauthorized(new { message = "Non autorisé" });

            var offers = await _bookOfferService.GetByOwnerIdAsync(ownerId);
            return Ok(offers);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("offers/{offerId}")]
        public async Task<IActionResult> GetOfferById(long offerId)
        {
            var offer = await _bookOfferService.GetByIdAsync(offerId);
            if (offer == null)
                return NotFound(new { message = "Offre non trouvée" });
            return Ok(offer);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("{postId}/offer")]
        public async Task<IActionResult> GetOfferByPostId(long postId)
        {
            var offer = await _bookOfferService.GetByPostIdAsync(postId);
            if (offer == null)
                return NotFound(new { message = "Offre non trouvée" });
            return Ok(offer);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("offers/{id}")]
        public async Task<IActionResult> UpdateOffer(long id, [FromBody] UpdateBookOfferDTO updateDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var offer = await _bookOfferService.UpdateAsync(id, updateDto, userId.Value);
                return Ok(offer);
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

        [Authorize(Roles = "Customer")]
        [HttpDelete("offers/{id}")]
        public async Task<IActionResult> DeleteOffer(long id)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var result = await _bookOfferService.DeleteAsync(id, userId.Value);
                if (result)
                    return Ok(new { message = "Offre supprimée" });
                return NotFound(new { message = "Offre non trouvée" });
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

        [Authorize(Roles = "Customer")]
        [HttpGet("offers/{offerId}/claims")]
        public async Task<IActionResult> GetClaimsByOfferId(long offerId)
        {
            var claims = await _bookClaimService.GetByBookOfferIdAsync(offerId);
            return Ok(claims);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("offers/{offerId}/has-claimed")]
        public async Task<IActionResult> HasUserClaimed(long offerId)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var hasClaimed = await _bookClaimService.HasUserClaimedAsync(offerId, userId.Value);
                return Ok(new { hasClaimed });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("claims/{claimId}")]
        public async Task<IActionResult> GetClaimById(long claimId)
        {
            var claim = await _bookClaimService.GetByIdAsync(claimId);
            if (claim == null)
                return NotFound(new { message = "Claim non trouvé" });
            return Ok(claim);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("claims/my")]
        public async Task<IActionResult> GetMyClaims()
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            var claims = await _bookClaimService.GetByCustomerIdAsync(userId.Value);
            return Ok(claims);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("claims/status/{status}")]
        public async Task<IActionResult> GetClaimsByStatus(string status)
        {
            var claims = await _bookClaimService.GetByStatusAsync(status);
            return Ok(claims);
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("claim")]
        public async Task<IActionResult> CreateClaim([FromBody] CreateBookClaimDTO createDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var claim = await _bookClaimService.CreateAsync(createDto, userId.Value);
                return Ok(claim);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("claim/{id}")]
        public async Task<IActionResult> UpdateClaim(long id, [FromBody] UpdateBookClaimDTO updateDto)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var claim = await _bookClaimService.UpdateAsync(id, updateDto, userId.Value);
                return Ok(claim);
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

        [Authorize(Roles = "Customer")]
        [HttpPost("claim/{id}/approve")]
        public async Task<IActionResult> ApproveClaim(long id)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var result = await _bookClaimService.ApproveClaimAsync(id, userId.Value);
                if (result)
                    return Ok(new { message = "Claim approuvé" });
                return BadRequest(new { message = "Impossible d'approuver le claim" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("claim/{id}")]
        public async Task<IActionResult> DeleteClaim(long id)
        {
            var userId = UserHelper.GetCurrentUserId(HttpContext);
            if (!userId.HasValue)
                return Unauthorized(new { message = "Non authentifié" });

            try
            {
                var result = await _bookClaimService.DeleteAsync(id, userId.Value);
                if (result)
                    return Ok(new { message = "Claim supprimé" });
                return NotFound(new { message = "Claim non trouvé" });
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

