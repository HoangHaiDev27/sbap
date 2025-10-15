using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
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
        /// <summary>
        /// Lấy danh sách OrderItem của user với thông tin Book và Chapter
        /// </summary>
        public async Task<List<OrderItem>> GetUserOrderItemsWithDetailsAsync(int userId)
        {
            return await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .OrderByDescending(oi => oi.PaidAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách OrderItem của user (chỉ thông tin cơ bản)
        /// </summary>
        public async Task<List<OrderItem>> GetUserOrderItemsAsync(int userId)
        {
            return await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .OrderByDescending(oi => oi.PaidAt)
                .ToListAsync();
        }
    }
}
