using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class PostReactionService : IPostReactionService
    {
        private readonly IPostReactionRepository _postReactionRepository;
        private readonly IPostRepository _postRepository;
        private readonly IMapper _mapper;
        private readonly VieBookContext _context;

        public PostReactionService(
            IPostReactionRepository postReactionRepository,
            IPostRepository postRepository,
            IMapper mapper,
            VieBookContext context)
        {
            _postReactionRepository = postReactionRepository;
            _postRepository = postRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<PostReactionDTO?> GetByPostAndUserAsync(long postId, int userId)
        {
            var reaction = await _postReactionRepository.GetByPostAndUserAsync(postId, userId);
            return reaction == null ? null : _mapper.Map<PostReactionDTO>(reaction);
        }

        public async Task<List<PostReactionDTO>> GetByPostIdAsync(long postId)
        {
            var reactions = await _postReactionRepository.GetByPostIdAsync(postId);
            return _mapper.Map<List<PostReactionDTO>>(reactions);
        }

        public async Task<int> GetReactionCountByPostIdAsync(long postId)
        {
            return await _postReactionRepository.GetReactionCountByPostIdAsync(postId);
        }

        public async Task<PostReactionDTO> ToggleReactionAsync(CreatePostReactionDTO createDto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if reaction already exists
                var existingReaction = await _postReactionRepository.GetByPostAndUserAsync(createDto.PostId, userId);
                
                if (existingReaction != null)
                {
                    // If same reaction type, remove it (toggle off)
                    if (existingReaction.ReactionType == createDto.ReactionType)
                    {
                        await _postReactionRepository.DeleteAsync(createDto.PostId, userId);
                        
                        // Update post reaction count
                        var post = await _postRepository.GetByIdAsync(createDto.PostId);
                        if (post != null)
                        {
                            post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                            await _postRepository.UpdateAsync(post);
                        }
                        
                        await transaction.CommitAsync();
                        return null!; // Return null to indicate reaction was removed
                    }
                    else
                    {
                        // Update reaction type
                        await _postReactionRepository.UpdateReactionTypeAsync(createDto.PostId, userId, createDto.ReactionType);
                        existingReaction.ReactionType = createDto.ReactionType;
                        await transaction.CommitAsync();
                        return _mapper.Map<PostReactionDTO>(existingReaction);
                    }
                }
                else
                {
                    // Create new reaction
                    var reaction = new PostReaction
                    {
                        PostId = createDto.PostId,
                        UserId = userId,
                        ReactionType = createDto.ReactionType,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdReaction = await _postReactionRepository.CreateAsync(reaction);
                    
                    // Update post reaction count
                    var post = await _postRepository.GetByIdAsync(createDto.PostId);
                    if (post != null)
                    {
                        post.ReactionCount = post.ReactionCount + 1;
                        await _postRepository.UpdateAsync(post);
                    }
                    
                    await transaction.CommitAsync();
                    var reactionWithUser = await _postReactionRepository.GetByPostAndUserAsync(createDto.PostId, userId);
                    return _mapper.Map<PostReactionDTO>(reactionWithUser!);
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteReactionAsync(long postId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var deleted = await _postReactionRepository.DeleteAsync(postId, userId);
                
                if (deleted)
                {
                    // Update post reaction count
                    var post = await _postRepository.GetByIdAsync(postId);
                    if (post != null)
                    {
                        post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                        await _postRepository.UpdateAsync(post);
                    }
                }
                
                await transaction.CommitAsync();
                return deleted;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}


