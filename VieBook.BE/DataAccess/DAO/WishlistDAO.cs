using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class WishlistDAO
    {
        private readonly VieBookContext _context;

        public WishlistDAO(VieBookContext context)
        {
            _context = context;
        }

        public Task<bool> IsInWishlistAsync(int userId, int bookId)
        {
            return _context.Wishlists.AnyAsync(w => w.UserId == userId && w.BookId == bookId);
        }

        public async Task<Wishlist> AddAsync(int userId, int bookId)
        {
            var existing = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
            if (existing != null)
            {
                return existing;
            }

            var entity = new Wishlist
            {
                UserId = userId,
                BookId = bookId
            };
            _context.Wishlists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> RemoveAsync(int userId, int bookId)
        {
            var existing = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
            if (existing == null)
            {
                return false;
            }
            _context.Wishlists.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public Task<List<Book>> GetUserWishlistBooksAsync(int userId)
        {
            return _context.Wishlists
                .Where(w => w.UserId == userId)
                .Select(w => w.Book)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}


