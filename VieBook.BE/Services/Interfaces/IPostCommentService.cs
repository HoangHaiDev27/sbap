using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IPostCommentService
    {
        Task<PostCommentDTO?> GetByIdAsync(long commentId);
        Task<List<PostCommentDTO>> GetByPostIdAsync(long postId);
        Task<int> GetCommentCountByPostIdAsync(long postId);
        Task<PostCommentDTO> CreateAsync(CreatePostCommentDTO createDto, int userId);
        Task<PostCommentDTO> UpdateAsync(long commentId, UpdatePostCommentDTO updateDto, int userId);
        Task<bool> DeleteAsync(long commentId, int userId);
    }
}


