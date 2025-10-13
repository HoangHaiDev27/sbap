using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IBookmarkService
    {
        Task<List<BookmarkDTO>> GetUserBookmarksAsync(int userId);
        Task<BookmarkDTO?> GetBookmarkByUserAndChapterAsync(int userId, int chapterId);
        Task<BookmarkDTO> CreateOrUpdateBookmarkAsync(int userId, CreateBookmarkDTO bookmarkDto);
        Task<bool> DeleteBookmarkAsync(int userId, int bookmarkId);
        Task<bool> DeleteBookmarkByChapterAsync(int userId, int chapterId);
    }
}
