using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class PostReactionRepository : IPostReactionRepository
    {
        private readonly PostReactionDAO _postReactionDAO;

        public PostReactionRepository(PostReactionDAO postReactionDAO)
        {
            _postReactionDAO = postReactionDAO;
        }

        public Task<PostReaction?> GetByPostAndUserAsync(long postId, int userId)
            => _postReactionDAO.GetByPostAndUserAsync(postId, userId);

        public Task<List<PostReaction>> GetByPostIdAsync(long postId)
            => _postReactionDAO.GetByPostIdAsync(postId);

        public Task<int> GetReactionCountByPostIdAsync(long postId)
            => _postReactionDAO.GetReactionCountByPostIdAsync(postId);

        public Task<PostReaction> CreateAsync(PostReaction reaction)
            => _postReactionDAO.CreateAsync(reaction);

        public Task<bool> DeleteAsync(long postId, int userId)
            => _postReactionDAO.DeleteAsync(postId, userId);

        public Task<bool> UpdateReactionTypeAsync(long postId, int userId, string reactionType)
            => _postReactionDAO.UpdateReactionTypeAsync(postId, userId, reactionType);
    }
}


