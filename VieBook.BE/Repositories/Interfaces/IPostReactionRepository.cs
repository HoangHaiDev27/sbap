using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IPostReactionRepository
    {
        Task<PostReaction?> GetByPostAndUserAsync(long postId, int userId);
        Task<List<PostReaction>> GetByPostIdAsync(long postId);
        Task<int> GetReactionCountByPostIdAsync(long postId);
        Task<PostReaction> CreateAsync(PostReaction reaction);
        Task<bool> DeleteAsync(long postId, int userId);
        Task<bool> UpdateReactionTypeAsync(long postId, int userId, string reactionType);
    }
}


