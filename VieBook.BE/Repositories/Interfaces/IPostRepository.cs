using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<Post?> GetByIdAsync(long postId);
        Task<List<Post>> GetPostsAsync(string? postType = null, string? searchQuery = null, string? tag = null, int? authorId = null);
        Task<List<Post>> GetPostsByClaimedUserAsync(int userId);
        Task<List<Post>> GetPostsByAuthorIdAsync(int authorId, bool includeHidden = false);
        Task<Post> CreateAsync(Post post);
        Task<Post> UpdateAsync(Post post);
        Task<bool> DeleteAsync(long postId, int? deletedBy);
    }
}

