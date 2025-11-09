using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class PostCommentRepository : IPostCommentRepository
    {
        private readonly PostCommentDAO _postCommentDAO;

        public PostCommentRepository(PostCommentDAO postCommentDAO)
        {
            _postCommentDAO = postCommentDAO;
        }

        public Task<PostComment?> GetByIdAsync(long commentId)
            => _postCommentDAO.GetByIdAsync(commentId);

        public Task<List<PostComment>> GetByPostIdAsync(long postId)
            => _postCommentDAO.GetByPostIdAsync(postId);

        public Task<List<PostComment>> GetRepliesByCommentIdAsync(long parentCommentId)
            => _postCommentDAO.GetRepliesByCommentIdAsync(parentCommentId);

        public Task<int> GetCommentCountByPostIdAsync(long postId)
            => _postCommentDAO.GetCommentCountByPostIdAsync(postId);

        public Task<PostComment> CreateAsync(PostComment comment)
            => _postCommentDAO.CreateAsync(comment);

        public Task<PostComment> UpdateAsync(PostComment comment)
            => _postCommentDAO.UpdateAsync(comment);

        public Task<bool> DeleteAsync(long commentId, int? deletedBy)
            => _postCommentDAO.DeleteAsync(commentId, deletedBy);
    }
}


