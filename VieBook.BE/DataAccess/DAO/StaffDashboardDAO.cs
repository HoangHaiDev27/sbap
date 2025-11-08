using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess
{
    public class StaffDashboardDAO
    {
        private readonly VieBookContext _context;

        public StaffDashboardDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<StaffDashboardStatsDTO> GetStaffStatsAsync()
        {
            var stats = new StaffDashboardStatsDTO();

            // Tổng số sách (đã được duyệt)
            stats.TotalBooks = await _context.Books
                .Where(b => b.Status == "Approved")
                .CountAsync();

            // Số lượng Book Owners
            stats.BookOwners = await _context.Users
                .Where(u => u.Roles.Any(r => r.RoleName == "Owner"))
                .CountAsync();

            // Số lượng Customers
            stats.Customers = await _context.Users
                .Where(u => u.Roles.Any(r => r.RoleName == "Customer"))
                .CountAsync();

            // Sách chờ duyệt (Status = "Active")
            stats.PendingBooks = await _context.Books
                .Where(b => b.Status == "Active")
                .CountAsync();

            // Yêu cầu rút tiền đang chờ
            stats.PendingWithdrawals = await _context.PaymentRequests
                .Where(pr => pr.Status == "Pending")
                .CountAsync();

            // Giao dịch nạp xu hôm nay
            var today = DateTime.UtcNow.Date;
            stats.TodayWalletTransactions = await _context.WalletTransactions
                .Where(wt => wt.Status == "Succeeded" && 
                            wt.CreatedAt.Date == today)
                .CountAsync();

            // Đánh giá mới 7 ngày qua
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            stats.NewReviewsLast7Days = await _context.BookReviews
                .Where(br => br.CreatedAt >= sevenDaysAgo)
                .CountAsync();

            // Subscriptions đang active (đã bắt đầu và chưa kết thúc)
            var now = DateTime.UtcNow;
            stats.ActiveSubscriptions = await _context.Subscriptions
                .Where(s => s.Status == "Active" && s.StartAt <= now && s.EndAt > now)
                .CountAsync();

            return stats;
        }

        public async Task<List<TopBookDTO>> GetTopBooksAsync(int limit = 5)
        {
            var topBooks = await _context.OrderItems
                .Where(oi => oi.PaidAt != null)
                .Join(_context.Chapters,
                    oi => oi.ChapterId,
                    c => c.ChapterId,
                    (oi, c) => new { OrderItem = oi, Chapter = c })
                .Join(_context.Books,
                    oc => oc.Chapter.BookId,
                    b => b.BookId,
                    (oc, b) => new { oc.OrderItem, oc.Chapter, Book = b })
                .GroupBy(x => new { 
                    x.Book.BookId, 
                    x.Book.Title, 
                    x.Book.Author 
                })
                .Select(g => new TopBookDTO
                {
                    BookId = g.Key.BookId,
                    Title = g.Key.Title ?? string.Empty,
                    Author = g.Key.Author ?? string.Empty,
                    SalesCount = g.Count(),
                    Revenue = g.Sum(x => x.OrderItem.CashSpent)
                })
                .OrderByDescending(b => b.SalesCount)
                .Take(limit)
                .ToListAsync();

            return topBooks;
        }

        public async Task<List<TopOwnerDTO>> GetTopOwnersAsync(int limit = 5)
        {
            var topOwners = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.UserProfile)
                .Include(u => u.Books)
                .Where(u => u.Roles.Any(r => r.RoleName == "Owner"))
                .Select(u => new TopOwnerDTO
                {
                    OwnerId = u.UserId,
                    Name = u.UserProfile != null ? u.UserProfile.FullName ?? string.Empty : string.Empty,
                    Email = u.Email,
                    BookCount = u.Books.Count(b => b.Status == "Approved"),
                    Revenue = _context.OrderItems
                        .Where(oi => oi.PaidAt != null && 
                                    oi.Chapter.Book.OwnerId == u.UserId)
                        .Sum(oi => (decimal?)oi.CashSpent) ?? 0
                })
                .Where(o => o.BookCount > 0)
                .OrderByDescending(o => o.Revenue)
                .Take(limit)
                .ToListAsync();

            return topOwners;
        }

        public async Task<List<PendingBookDTO>> GetPendingBooksAsync(int limit = 5)
        {
            var pendingBooks = await _context.Books
                .Include(b => b.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Where(b => b.Status == "Active")
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .Select(b => new PendingBookDTO
                {
                    BookId = b.BookId,
                    Title = b.Title ?? string.Empty,
                    Author = b.Author ?? string.Empty,
                    OwnerId = b.OwnerId,
                    OwnerName = b.Owner.UserProfile != null 
                        ? b.Owner.UserProfile.FullName ?? b.Owner.Email 
                        : b.Owner.Email,
                    CreatedAt = b.CreatedAt,
                    CategoryName = b.Categories != null && b.Categories.Any() 
                        ? b.Categories.First().Name 
                        : "Khác"
                })
                .ToListAsync();

            return pendingBooks;
        }

        public async Task<List<RecentFeedbackDTO>> GetRecentFeedbacksAsync(int limit = 5)
        {
            var recentFeedbacks = await _context.UserFeedbacks
                .Include(uf => uf.FromUser)
                    .ThenInclude(u => u.UserProfile)
                .Where(uf => uf.DeletedAt == null)
                .OrderByDescending(uf => uf.CreatedAt)
                .Take(limit)
                .Select(uf => new RecentFeedbackDTO
                {
                    FeedbackId = uf.FeedbackId,
                    UserName = uf.FromUser != null
                        ? (uf.FromUser.UserProfile != null 
                            ? uf.FromUser.UserProfile.FullName ?? uf.FromUser.Email 
                            : uf.FromUser.Email)
                        : "Người dùng ẩn danh",
                    TargetType = uf.TargetType ?? "Khác",
                    Content = uf.Content ?? string.Empty,
                    CreatedAt = uf.CreatedAt
                })
                .ToListAsync();

            return recentFeedbacks;
        }

        public async Task<StaffDashboardDTO> GetStaffDashboardAsync()
        {
            var stats = await GetStaffStatsAsync();
            var topBooks = await GetTopBooksAsync(5);
            var topOwners = await GetTopOwnersAsync(5);

            return new StaffDashboardDTO
            {
                Stats = stats,
                TopBooks = topBooks,
                TopOwners = topOwners
            };
        }
    }
}

