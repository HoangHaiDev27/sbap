using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IPostReactionService
    {
        Task<PostReactionDTO?> GetByPostAndUserAsync(long postId, int userId);
        Task<List<PostReactionDTO>> GetByPostIdAsync(long postId);
        Task<int> GetReactionCountByPostIdAsync(long postId);
        Task<PostReactionDTO> ToggleReactionAsync(CreatePostReactionDTO createDto, int userId);
        Task<bool> DeleteReactionAsync(long postId, int userId);
    }
}


