using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IPostCommentRepository
    {
        Task<PostComment?> GetByIdAsync(long commentId);
        Task<List<PostComment>> GetByPostIdAsync(long postId);
        Task<List<PostComment>> GetRepliesByCommentIdAsync(long parentCommentId);
        Task<int> GetCommentCountByPostIdAsync(long postId);
        Task<PostComment> CreateAsync(PostComment comment);
        Task<PostComment> UpdateAsync(PostComment comment);
        Task<bool> DeleteAsync(long commentId, int? deletedBy);
    }
}


