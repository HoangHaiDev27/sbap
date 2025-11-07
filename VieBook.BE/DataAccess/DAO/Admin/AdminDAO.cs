using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO.Admin
{
    public class AdminDAO
    {
        private readonly VieBookContext _context;

        public AdminDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<User?> GetAdminByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id && u.Roles.Any(r => r.RoleName == "Admin"));
        }

        public async Task<User> UpdateAdminAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
       public async Task<AdminStatisticDTO> GetStatisticsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            // Nếu không truyền vào, mặc định lấy 30 ngày gần nhất
            var now = DateTime.UtcNow;
            var startDate = fromDate ?? now.AddDays(-30);
            var endDate = toDate ?? now;

            // ===== Helper tính phần trăm thay đổi =====
            double CalcChange(double current, double previous)
            {
                if (previous <= 0) return current > 0 ? 100 : 0;
                return Math.Round((current - previous) / previous * 100, 1);
            }

            // ===== 1. Tổng số sách =====
            int totalBooks = await _context.Books.CountAsync(b => b.Status == "Approved" && b.CreatedAt <= endDate);
            int prevBooks = await _context.Books.CountAsync(b => b.Status == "Approved" && b.CreatedAt < startDate);
            double bookChange = CalcChange(totalBooks, prevBooks);

            // ===== 2. Sách nói =====
            int audioBooks = await _context.Books
            .Where(b => b.Status == "Approved" && 
                        b.Chapters.Any(c => c.ChapterAudios.Any() && c.Status == "Active") &&
                        b.CreatedAt <= endDate)
            .CountAsync();

            int prevAudioBooks = await _context.Books
                .Where(b => b.Status == "Approved" && 
                            b.Chapters.Any(c => c.ChapterAudios.Any() && c.Status == "Active") &&
                            b.CreatedAt < startDate)
                .CountAsync();

            double audioChange = CalcChange(audioBooks, prevAudioBooks);

            // ===== 3. Chủ sở hữu =====
            int owners = await _context.Users.CountAsync(u => u.Roles.Any(r => r.RoleName == "Owner") && u.CreatedAt <= endDate);
            int prevOwners = await _context.Users.CountAsync(u => u.Roles.Any(r => r.RoleName == "Owner") && u.CreatedAt < startDate);
            double ownerChange = CalcChange(owners, prevOwners);

            // ===== 4. Khách hàng =====
            int customers = await _context.Users.CountAsync(u => u.Roles.Any(r => r.RoleName == "Customer") && u.CreatedAt <= endDate);
            int prevCustomers = await _context.Users.CountAsync(u => u.Roles.Any(r => r.RoleName == "Customer") && u.CreatedAt < startDate);
            double customerChange = CalcChange(customers, prevCustomers);

            // ===== 5. Nhân viên =====
            int staffs = await _context.Users
            .Where(u => u.Roles.Count == 1 && u.Roles.Any(r => r.RoleName == "Staff") && u.CreatedAt <= endDate).CountAsync();

            int prevStaffs = await _context.Users
            .Where(u => u.Roles.Count == 1 && u.Roles.Any(r => r.RoleName == "Staff") && u.CreatedAt < startDate).CountAsync();
            double staffChange = CalcChange(staffs, prevStaffs);

            // ===== 6. Giao dịch & doanh thu =====
            var transactionsQuery = _context.WalletTransactions
                .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate && t.Status == "Succeeded");

            int monthlyTransactions = await transactionsQuery.CountAsync();
            decimal monthlyRevenue = await transactionsQuery.SumAsync(t => (decimal?)t.AmountMoney) ?? 0;

            // Kỳ trước
            var prevTransactionsQuery = _context.WalletTransactions
                .Where(t => t.CreatedAt < startDate && t.Status == "Succeeded");
            int prevTransactions = await prevTransactionsQuery.CountAsync();
            decimal prevRevenue = await prevTransactionsQuery.SumAsync(t => (decimal?)t.AmountMoney) ?? 0;

            double transactionChange = CalcChange(monthlyTransactions, prevTransactions);
            double revenueChange = CalcChange((double)monthlyRevenue, (double)prevRevenue);

            // ===== 7. Feedback =====
            // Phản hồi trong kỳ hiện tại
            var reviewsQuery = _context.BookReviews
                .Where(r => r.CreatedAt >= startDate && r.CreatedAt <= endDate);

            int currentReviews = await reviewsQuery.CountAsync();

            // Phản hồi kỳ trước
            var prevReviewsQuery = _context.BookReviews
                .Where(r => r.CreatedAt < startDate);

            int prevReviews = await prevReviewsQuery.CountAsync();

            // Phản hồi tích cực (>= 4 sao) trong kỳ hiện tại
            int positiveReviews = await reviewsQuery.CountAsync(r => r.Rating >= 4);

            // Trung bình điểm đánh giá trong kỳ hiện tại
            double avgRating = currentReviews > 0
                ? await reviewsQuery.AverageAsync(r => r.Rating)
                : 0;

            // Tỷ lệ phản hồi tích cực trong kỳ hiện tại
            double positivePercent = currentReviews > 0
                ? Math.Round((double)positiveReviews / currentReviews * 100, 1)
                : 0;

            // So sánh thay đổi phản hồi mới giữa 2 kỳ
            double feedbackChangePercent = CalcChange(currentReviews, prevReviews);


            // ===== 8. Biểu đồ: Sách theo ngày =====
            var booksByDayRaw = await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= startDate && b.CreatedAt <= endDate)
                .GroupBy(b => b.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Books = g.Count() })
                .OrderBy(g => g.Date)
                .ToListAsync();

            var booksByDayData = booksByDayRaw
                .Select(x => new BookByDayDTO
                {
                    Date = x.Date.ToString("dd/MM"),
                    Books = x.Books
                })
                .ToList();

            // ===== 9. Biểu đồ: Doanh thu theo tháng =====
            var revenueRaw = await _context.WalletTransactions
                .Where(t => t.CreatedAt >= startDate && t.CreatedAt <= endDate && t.Status == "Succeeded")
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(t => t.AmountMoney) })
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Month)
                .ToListAsync();

            var revenueData = revenueRaw
                .Select(r => new RevenueByMonthDTO
                {
                    Month = $"Th{r.Month}",
                    Revenue = r.Revenue
                })
                .ToList();

            // ===== 10. Phân loại sách =====
            var categoryRaw = await _context.Categories
                .Select(c => new
                {
                    c.Name,
                    Count = c.Books.Count(b => b.Status == "Approved" && b.CreatedAt >= startDate && b.CreatedAt <= endDate)
                })
                .ToListAsync();

            int totalCategoryBooks = categoryRaw.Sum(c => c.Count);
            var categoryDistribution = categoryRaw
                .Select(c => new CategoryDistributionDTO
                {
                    Name = c.Name,
                    Count = c.Count,
                    Percentage = totalCategoryBooks > 0
                        ? Math.Round((double)c.Count / totalCategoryBooks * 100, 1)
                        : 0
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            // ===== 11. Trả về DTO =====
            return new AdminStatisticDTO
            {
                TotalBooks = totalBooks,
                AudioBooks = audioBooks,
                BookOwners = owners,
                Customers = customers,
                Staffs = staffs,
                MonthlyTransactions = monthlyTransactions,
                MonthlyRevenue = Math.Round(monthlyRevenue, 2),
                PositiveFeedbackPercent = positivePercent,
                AverageRating = Math.Round(avgRating, 2),

                // Change %
                BooksChangePercent = bookChange,
                AudioChangePercent = audioChange,
                BookOwnerChangePercent = ownerChange,
                CustomerChangePercent = customerChange,
                StaffChangePercent = staffChange,
                TransactionChangePercent = transactionChange,
                RevenueChangePercent = revenueChange,
                FeedbackChangePercent = feedbackChangePercent,

                BooksByDayData = booksByDayData,
                RevenueData = revenueData,
                CategoryDistribution = categoryDistribution
            };
        }
    }
}
