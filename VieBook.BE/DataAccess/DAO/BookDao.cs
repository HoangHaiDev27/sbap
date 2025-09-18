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

    }
}
