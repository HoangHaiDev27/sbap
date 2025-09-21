using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class BookDao
    {
        private readonly VieBookContext _context;
        public BookDao(VieBookContext context)
        {
            _context = context;
        }

        public async Task<Book?> GetBookDetailAsync(int id)
        {
            var book = await _context.Books
                            .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                            .Include(b => b.Categories)
                            .Include(b => b.Chapters)
                            .Include(b => b.BookReviews)
                                .ThenInclude(r => r.User).ThenInclude(u => u.UserProfile)
                            .FirstOrDefaultAsync(b => b.BookId == id);

            return book;
        }
        //lấy book không có audio 
        public async Task<List<Book>> GetReadBooksAsync()
        {
            return await _context.Books
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile) // lấy tác giả
                .Include(b => b.Categories) // lấy category
                .Include(b => b.Chapters) // để map Price, Duration, Chapters
                .Include(b => b.BookReviews) // để map Rating, Reviews
                .Where(b => b.Chapters.Any(c => c.ChapterSoftUrl != null)) // chỉ sách có soft copy
                .ToListAsync();
        }

        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
        {
            return await _context.Chapters
                .Where(c => c.BookId == bookId)
                .OrderBy(c => c.ChapterId)
                .ToListAsync();
        }
        // lấy sách audio
        public async Task<List<Book>> GetAudioBooksAsync()
        {
            return await _context.Books
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterAudioUrl != null)) // chỉ sách có audio
                .ToListAsync();
        }

        public async Task<Book?> GetAudioBookDetailAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews)
                    .ThenInclude(r => r.User).ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(b => b.BookId == id && b.Chapters.Any(c => c.ChapterAudioUrl != null));
        }


        public async Task<List<Book>> GetAllAsync()
        {
            return await _context.Books
                .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews).ThenInclude(r => r.User).ThenInclude(u => u.UserProfile)
                .ToListAsync();
        }

        public async Task AddAsync(Book book)
        {
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
        }

        // Thêm nhiều Category cho 1 Book bằng raw SQL
        public async Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds)
        {
            if (categoryIds == null || categoryIds.Count == 0) return;

            foreach (var catId in categoryIds)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO BookCategories (BookId, CategoryId) VALUES ({0}, {1})",
                    bookId, catId);
            }
        }
        // Xoá toàn bộ Category liên kết với 1 Book
        public async Task RemoveCategoriesByBookIdAsync(int bookId)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM BookCategories WHERE BookId = {0}",
                bookId
            );
        }

        // check isbn
        public async Task<bool> IsIsbnExistsAsync(string isbn)
        {
            return await _context.Books.AnyAsync(b => b.Isbn == isbn);
        }
        public async Task UpdateAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Book book)
        {
            book.Status = "InActive";
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books.FindAsync(id);
        }

        // Lấy tất cả sách theo OwnerId
        public async Task<List<Book>> GetBooksByOwnerId(int ownerId)
        {
            return await _context.Books
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                    .ThenInclude(c => c.OrderItems) 
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                    .ThenInclude(o => o.UserProfile) 
                .Where(b => b.OwnerId == ownerId)
                .ToListAsync();
        }

    }
}
