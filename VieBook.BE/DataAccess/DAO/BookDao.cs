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
            return await _context.Books
                .Include(b => b.Owner)
                    .ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .FirstOrDefaultAsync(b => b.BookId == id);
        }

    }
}
