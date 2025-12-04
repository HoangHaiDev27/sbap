using BusinessObject.Dtos;
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

            var totalOrders = orders.Count;
            
            // Đếm số chapter soft
            var softChapters = orders.Count(oi => oi.OrderType == "BuyChapterSoft");
            
            // Đếm số chapter audio
            var audioChapters = orders.Count(oi => oi.OrderType == "BuyChapterAudio");
            
            var totalRevenue = orders
                .Where(oi => oi.OrderType != "Refund")
                .Sum(oi => oi.CashSpent);

            return new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                SoftChapters = softChapters,
                AudioChapters = audioChapters
            };
        }

        /// <summary>
        /// Tạo một OrderItem mới
        /// </summary>
        public async Task<OrderItem> CreateOrderItemAsync(OrderItem orderItem)
        {
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync();
            return orderItem;
        }

        /// <summary>
        /// Tạo nhiều OrderItems cùng lúc
        /// </summary>
        public async Task CreateOrderItemsAsync(List<OrderItem> orderItems)
        {
            _context.OrderItems.AddRange(orderItems);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Kiểm tra user có sở hữu chapter không (bất kỳ loại nào)
        /// </summary>
        public async Task<bool> CheckChapterOwnershipAsync(int userId, int chapterId)
        {
            return await _context.OrderItems
                .AnyAsync(oi => oi.CustomerId == userId
                    && oi.ChapterId == chapterId
                    && oi.PaidAt != null);
        }

        /// <summary>
        /// Kiểm tra user có quyền đọc bản mềm không
        /// </summary>
        public async Task<bool> CheckChapterSoftOwnershipAsync(int userId, int chapterId)
        {
            return await _context.OrderItems
                .AnyAsync(oi => oi.CustomerId == userId
                    && oi.ChapterId == chapterId
                    && oi.PaidAt != null
                    && (oi.OrderType == "BuyChapterSoft" || oi.OrderType == "BuyChapterBoth"));
        }

        /// <summary>
        /// Kiểm tra user có quyền nghe bản audio không
        /// </summary>
        public async Task<bool> CheckChapterAudioOwnershipAsync(int userId, int chapterId)
        {
            return await _context.OrderItems
                .AnyAsync(oi => oi.CustomerId == userId
                    && oi.ChapterId == chapterId
                    && oi.PaidAt != null
                    && (oi.OrderType == "BuyChapterAudio" || oi.OrderType == "BuyChapterBoth"));
        }

        /// <summary>
        /// Lấy danh sách chapters đã mua của user
        /// </summary>
        public async Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId)
        {
            return await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .Select(oi => new OrderItemDTO
                {
                    OrderItemId = oi.OrderItemId,
                    ChapterId = oi.ChapterId,
                    ChapterTitle = oi.Chapter.ChapterTitle,
                    BookId = oi.Chapter.BookId,
                    UnitPrice = oi.UnitPrice,
                    CashSpent = oi.CashSpent,
                    PaidAt = oi.PaidAt ?? DateTime.UtcNow,
                    OrderType = oi.OrderType ?? "BuyChapter"
                })
                .ToListAsync();
        }

        /// <summary>
        /// Lấy danh sách sách đã mua của user (group by book)
        /// </summary>
        public async Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId)
        {
            return await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .GroupBy(oi => oi.Chapter.BookId)
                .Select(g => new UserPurchasedBooksDTO
                {
                    BookId = g.Key,
                    Title = g.First().Chapter.Book.Title,
                    Description = g.First().Chapter.Book.Description,
                    CoverUrl = g.First().Chapter.Book.CoverUrl,
                    Author = g.First().Chapter.Book.Author,
                    PurchasedChaptersCount = g.Count(),
                    TotalSpent = g.Sum(oi => oi.CashSpent),
                    LastPurchasedAt = g.Max(oi => oi.PaidAt!.Value),
                    TotalChaptersCount = _context.Chapters.Count(c => c.BookId == g.Key && c.Status == "Active")
                })
                .ToListAsync();
        }
    }
}
