using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IPostService
    {
        Task<PostDTO?> GetByIdAsync(long postId);
        Task<List<PostDTO>> GetPostsAsync(string? postType = null, string? searchQuery = null, string? tag = null, int? authorId = null, string? visibility = null);
        Task<List<PostDTO>> GetPostsByClaimedUserAsync(int userId);
        Task<List<PostDTO>> GetPostsByAuthorIdAsync(int authorId, bool includeHidden = false);
        Task<PostDTO> CreateAsync(CreatePostDTO createDto, int authorId);
        Task<PostDTO> UpdateAsync(long postId, CreatePostDTO updateDto, int authorId);
        Task<bool> DeleteAsync(long postId, int? deletedBy);
        Task<PostDTO> UpdateVisibilityAsync(long postId, string visibility, int userId, bool isStaff = false);
    }
}

