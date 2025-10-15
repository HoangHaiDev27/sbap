using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class OrderItemRepository : IOrderItemRepository
    {
        private readonly VieBookContext _context;

        public OrderItemRepository(VieBookContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderItem>> GetPurchasedBooksByUserIdAsync(int userId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.Categories)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.BookReviews)
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .ToListAsync();
        }

        public async Task<OrderItem?> GetOrderItemByIdAsync(long orderItemId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.Categories)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                        .ThenInclude(b => b.BookReviews)
                .Include(oi => oi.Customer)
                .FirstOrDefaultAsync(oi => oi.OrderItemId == orderItemId);
        }

    }
}
