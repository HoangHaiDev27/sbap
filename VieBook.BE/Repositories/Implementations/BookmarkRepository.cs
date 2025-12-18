using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class BookmarkRepository : IBookmarkRepository
    {
        private readonly BookmarkDAO _dao;

        public BookmarkRepository(BookmarkDAO dao)
        {
            _dao = dao;
        }

        public async Task<List<Bookmark>> GetUserBookmarksAsync(int userId)
        {
            return await _dao.GetUserBookmarksAsync(userId);
        }

        public async Task<Bookmark?> GetBookmarkByUserAndBookAsync(int userId, int bookId)
        {
            return await _dao.GetBookmarkByUserAndBookAsync(userId, bookId);
        }

        public async Task<Bookmark?> GetBookmarkByUserAndChapterAsync(int userId, int chapterId)
        {
            return await _dao.GetBookmarkByUserAndChapterAsync(userId, chapterId);
        }

        public async Task<Bookmark> CreateBookmarkAsync(Bookmark bookmark)
        {
            return await _dao.CreateBookmarkAsync(bookmark);
        }

        public async Task<Bookmark> UpdateBookmarkAsync(Bookmark bookmark)
        {
            return await _dao.UpdateBookmarkAsync(bookmark);
        }

        public async Task<bool> DeleteBookmarkAsync(int bookmarkId)
        {
            return await _dao.DeleteBookmarkAsync(bookmarkId);
        }

        public async Task<bool> DeleteBookmarkByUserAndChapterAsync(int userId, int chapterId)
        {
            return await _dao.DeleteBookmarkByUserAndChapterAsync(userId, chapterId);
        }

        public async Task<List<Bookmark>> GetBookmarksByUserIdAsync(int userId)
        {
            return await _dao.GetBookmarksByUserIdAsync(userId);
        }
    }
}
