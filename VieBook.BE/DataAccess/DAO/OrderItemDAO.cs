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
                    .ThenInclude(c => c.UserProfile)
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
                    .ThenInclude(c => c.UserProfile)
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

        /// <summary>
        /// Lấy danh sách OrderItem của owner (sách được mua từ owner)
        /// </summary>
        public async Task<List<OrderItem>> GetOwnerOrderItemsAsync(int ownerId)
        {
            return await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .Include(oi => oi.Customer)
                    .ThenInclude(c => c.UserProfile)
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .OrderByDescending(oi => oi.PaidAt)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy thống kê orders của owner
        /// </summary>
        public async Task<object> GetOwnerOrderStatsAsync(int ownerId)
        {
            var orders = await _context.OrderItems
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .ToListAsync();

            var totalRevenue = orders.Sum(oi => oi.CashSpent);
            var totalOrders = orders.Count;
            var completedOrders = orders.Count(oi => oi.OrderType == "BuyChapter");
            var refundedOrders = orders.Count(oi => oi.OrderType == "Refund");

            return new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                CompletedOrders = completedOrders,
                RefundedOrders = refundedOrders
            };
        }
    }
}
