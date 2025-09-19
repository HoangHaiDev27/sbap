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

    }
}
