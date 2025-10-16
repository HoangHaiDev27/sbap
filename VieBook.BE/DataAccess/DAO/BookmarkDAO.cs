using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class BookmarkDAO
    {
        private readonly VieBookContext _context;

        public BookmarkDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<List<Bookmark>> GetUserBookmarksAsync(int userId)
        {
            return await _context.Bookmarks
                .Include(b => b.Book)
                .Include(b => b.ChapterRead)
                .Include(b => b.ChapterListen)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Bookmark?> GetBookmarkByUserAndBookAsync(int userId, int bookId)
        {
            return await _context.Bookmarks
                .Include(b => b.Book)
                .Include(b => b.ChapterRead)
                .Include(b => b.ChapterListen)
                .FirstOrDefaultAsync(b => b.UserId == userId && b.BookId == bookId);
        }

        public async Task<Bookmark?> GetBookmarkByUserAndChapterAsync(int userId, int chapterId)
        {
            return await _context.Bookmarks
                .Include(b => b.Book)
                .Include(b => b.ChapterRead)
                .Include(b => b.ChapterListen)
                .FirstOrDefaultAsync(b => b.UserId == userId &&
                    (b.ChapterReadId == chapterId || b.ChapterListenId == chapterId));
        }

        public async Task<Bookmark> CreateBookmarkAsync(Bookmark bookmark)
        {
            bookmark.CreatedAt = DateTime.UtcNow;
            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();
            return bookmark;
        }

        public async Task<Bookmark> UpdateBookmarkAsync(Bookmark bookmark)
        {
            _context.Bookmarks.Update(bookmark);
            await _context.SaveChangesAsync();
            return bookmark;
        }

        public async Task<bool> DeleteBookmarkAsync(int bookmarkId)
        {
            var bookmark = await _context.Bookmarks.FindAsync(bookmarkId);
            if (bookmark == null) return false;

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBookmarkByUserAndChapterAsync(int userId, int chapterId)
        {
            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId &&
                    (b.ChapterReadId == chapterId || b.ChapterListenId == chapterId));

            if (bookmark == null) return false;

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}


