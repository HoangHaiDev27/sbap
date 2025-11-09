using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class PostRepository : IPostRepository
    {
        private readonly PostDAO _postDAO;

        public PostRepository(PostDAO postDAO)
        {
            _postDAO = postDAO;
        }

        public Task<Post?> GetByIdAsync(long postId)
            => _postDAO.GetByIdAsync(postId);

        public Task<List<Post>> GetPostsAsync(string? postType = null, string? searchQuery = null, string? tag = null, int? authorId = null)
            => _postDAO.GetPostsAsync(postType, searchQuery, tag, authorId);

        public Task<List<Post>> GetPostsByClaimedUserAsync(int userId)
            => _postDAO.GetPostsByClaimedUserAsync(userId);

        public Task<List<Post>> GetPostsByAuthorIdAsync(int authorId, bool includeHidden = false)
            => _postDAO.GetPostsByAuthorIdAsync(authorId, includeHidden);

        public Task<Post> CreateAsync(Post post)
            => _postDAO.CreateAsync(post);

        public Task<Post> UpdateAsync(Post post)
            => _postDAO.UpdateAsync(post);

        public Task<bool> DeleteAsync(long postId, int? deletedBy)
            => _postDAO.DeleteAsync(postId, deletedBy);
    }
}

