using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess
{
    public class OrderItemDAO
    {
        private readonly VieBookContext _context;

        public OrderItemDAO(VieBookContext context)
        {
            _context = context;
        }


        public async Task<OrderItem?> GetByIdAsync(long id)
        {
            return await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.Categories)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.BookReviews)
                .Include(oi => oi.Customer)
                .FirstOrDefaultAsync(oi => oi.OrderItemId == id);
        }

        public async Task<List<OrderItem>> GetPurchasedBooksByUserIdAsync(int userId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.Categories)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.BookReviews)
                .Include(oi => oi.Customer)
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .OrderByDescending(oi => oi.PaidAt)
                .ToListAsync();
        }



    }
}
