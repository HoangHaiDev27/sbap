using BusinessObject.Models;
using BusinessObject.Dtos;

namespace Repositories.Interfaces
{
    public interface IBookmarkRepository
    {
        Task<List<Bookmark>> GetUserBookmarksAsync(int userId);
        Task<Bookmark?> GetBookmarkByUserAndBookAsync(int userId, int bookId);
        Task<Bookmark?> GetBookmarkByUserAndChapterAsync(int userId, int chapterId);
        Task<Bookmark> CreateBookmarkAsync(Bookmark bookmark);
        Task<Bookmark> UpdateBookmarkAsync(Bookmark bookmark);
        Task<bool> DeleteBookmarkAsync(int bookmarkId);
        Task<bool> DeleteBookmarkByUserAndChapterAsync(int userId, int chapterId);
        Task<List<Bookmark>> GetBookmarksByUserIdAsync(int userId);
    }
}
