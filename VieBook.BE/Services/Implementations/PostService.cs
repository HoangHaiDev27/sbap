using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using DataAccess;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;

namespace Services.Implementations
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IBookOfferService _bookOfferService;
        private readonly IMapper _mapper;
        private readonly VieBookContext _context;
        
        // JSON options to not escape Unicode characters
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            WriteIndented = false
        };

        public PostService(
            IPostRepository postRepository,
            IBookOfferService bookOfferService,
            IMapper mapper,
            VieBookContext context)
        {
            _postRepository = postRepository;
            _bookOfferService = bookOfferService;
            _mapper = mapper;
            _context = context;
        }

        public async Task<PostDTO?> GetByIdAsync(long postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null) return null;
            var postDto = _mapper.Map<PostDTO>(post);
            
            // Calculate ClaimCount and ApprovedClaimCount for BookOffer if exists
            if (postDto.BookOffer != null)
            {
                postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
            }
            
            return postDto;
        }

        public async Task<List<PostDTO>> GetPostsAsync(string? postType = null, string? searchQuery = null, string? tag = null, int? authorId = null, string? visibility = null)
        {
            var posts = await _postRepository.GetPostsAsync(postType, searchQuery, tag, authorId, visibility);
            var postDtos = _mapper.Map<List<PostDTO>>(posts);
            
            // Calculate ClaimCount (total claims) and ApprovedClaimCount for each BookOffer
            foreach (var postDto in postDtos)
            {
                if (postDto.BookOffer != null)
                {
                    postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                    postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                }
            }
            
            return postDtos;
        }

        public async Task<List<PostDTO>> GetPostsByClaimedUserAsync(int userId)
        {
            var posts = await _postRepository.GetPostsByClaimedUserAsync(userId);
            var postDtos = _mapper.Map<List<PostDTO>>(posts);
            
            // Calculate ClaimCount and ApprovedClaimCount for each BookOffer
            foreach (var postDto in postDtos)
            {
                if (postDto.BookOffer != null)
                {
                    postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                    postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                }
            }
            
            return postDtos;
        }

        public async Task<List<PostDTO>> GetPostsByAuthorIdAsync(int authorId, bool includeHidden = false)
        {
            var posts = await _postRepository.GetPostsByAuthorIdAsync(authorId, includeHidden);
            var postDtos = _mapper.Map<List<PostDTO>>(posts);
            
            // Calculate ClaimCount and ApprovedClaimCount for each BookOffer
            foreach (var postDto in postDtos)
            {
                if (postDto.BookOffer != null)
                {
                    postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                    postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                }
            }
            
            return postDtos;
        }

        public async Task<PostDTO> CreateAsync(CreatePostDTO createDto, int authorId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var post = new Post
                {
                    AuthorId = authorId,
                    Title = createDto.Title,
                    Content = createDto.Content,
                    Tags = createDto.Tags != null && createDto.Tags.Count > 0 
                        ? JsonSerializer.Serialize(createDto.Tags, JsonOptions) 
                        : null,
                    PostType = createDto.PostType,
                    Visibility = createDto.Visibility ?? "Public",
                    CommentCount = 0,
                    ReactionCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                // Add the post directly to the context
                _context.Posts.Add(post);
                // Save to get the PostId
                await _context.SaveChangesAsync();

                // If it's a giveaway post, create the BookOffer
                if (createDto.PostType == "giveaway" && createDto.BookOffer != null)
                {
                    var createOfferDto = createDto.BookOffer;
                    createOfferDto.PostId = post.PostId;
                    await _bookOfferService.CreateAsync(createOfferDto, authorId);
                }

                // Create PostAttachment if imageUrl is provided (after getting PostId)
                if (!string.IsNullOrWhiteSpace(createDto.ImageUrl))
                {
                    var attachment = new PostAttachment
                    {
                        PostId = post.PostId,
                        FileType = "Image",
                        FileUrl = createDto.ImageUrl,
                        SortOrder = 0,
                        UploadedAt = DateTime.UtcNow
                    };
                    _context.PostAttachments.Add(attachment);
                    await _context.SaveChangesAsync(); // Save the attachment
                }

                await transaction.CommitAsync();

                // Reload post with includes to ensure attachments are loaded
                var postWithIncludes = await _postRepository.GetByIdAsync(post.PostId);
                if (postWithIncludes == null)
                    throw new Exception("Failed to reload post after creation");
                
                var postDto = _mapper.Map<PostDTO>(postWithIncludes);
                
                // Calculate ClaimCount and ApprovedClaimCount for BookOffer if exists
                if (postDto.BookOffer != null)
                {
                    postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                    postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                }
                
                return postDto;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PostDTO> UpdateAsync(long postId, CreatePostDTO updateDto, int authorId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
                throw new Exception("Post not found");

            if (post.AuthorId != authorId)
                throw new UnauthorizedAccessException("Not authorized to update this post");

            post.Content = updateDto.Content ?? post.Content;
            post.Title = updateDto.Title ?? post.Title;
            post.Tags = updateDto.Tags != null && updateDto.Tags.Count > 0 
                ? JsonSerializer.Serialize(updateDto.Tags, JsonOptions) 
                : (updateDto.Tags != null ? null : post.Tags);
            post.PostType = updateDto.PostType ?? post.PostType;
            post.Visibility = updateDto.Visibility ?? post.Visibility;
            post.UpdatedAt = DateTime.UtcNow;

            var updated = await _postRepository.UpdateAsync(post);
            return _mapper.Map<PostDTO>(updated);
        }

        public async Task<bool> DeleteAsync(long postId, int? deletedBy)
        {
            return await _postRepository.DeleteAsync(postId, deletedBy);
        }

        public async Task<PostDTO> UpdateVisibilityAsync(long postId, string visibility, int userId, bool isStaff = false)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
                throw new Exception("Post not found");

            // Staff can approve/reject posts (Pending -> Public/Rejected)
            // Authors can only change between Public and Hidden
            if (isStaff)
            {
                // Staff can change visibility to Public, Rejected, or Hidden
                if (visibility != "Public" && visibility != "Rejected" && visibility != "Hidden")
                    throw new ArgumentException("Visibility must be 'Public', 'Rejected', or 'Hidden'");
            }
            else
            {
                // Non-staff users can only change their own posts between Public and Hidden
                if (post.AuthorId != userId)
                    throw new UnauthorizedAccessException("Not authorized to update this post");

                if (visibility != "Public" && visibility != "Hidden")
                    throw new ArgumentException("Visibility must be 'Public' or 'Hidden'");
            }

            post.Visibility = visibility;
            post.UpdatedAt = DateTime.UtcNow;

            var updated = await _postRepository.UpdateAsync(post);
            var postDto = _mapper.Map<PostDTO>(updated);
            
            // Calculate ClaimCount and ApprovedClaimCount for BookOffer if exists
            if (postDto.BookOffer != null)
            {
                postDto.BookOffer.ClaimCount = await _bookOfferService.GetClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
                postDto.BookOffer.ApprovedClaimCount = await _bookOfferService.GetApprovedClaimCountForOfferAsync(postDto.BookOffer.BookOfferId);
            }
            
            return postDto;
        }
    }
}

