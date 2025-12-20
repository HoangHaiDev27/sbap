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
       public async Task<AdminStatisticDTO> GetStatisticsAsync(DateTime? fromDate = null,DateTime? toDate = null)
        {
            var now = DateTime.UtcNow;
            var startDate = fromDate ?? now.AddDays(-30);
            var endDate = toDate ?? now;

            if (startDate > endDate)
            {
                return new AdminStatisticDTO
                {
                    Message = "Ngày bắt đầu không được lớn hơn ngày kết thúc."
                };
            }

            // ===== Helper tính % thay đổi =====
            double CalcChange(double current, double previous)
            {
                if (previous <= 0)
                    return current > 0 ? 100 : 0;

                return Math.Round((current - previous) / previous * 100, 1);
            }

            // ================= 1. SÁCH =================
            int totalBooks = await _context.Books
                .CountAsync(b => b.Status == "Approved" && b.CreatedAt <= endDate);

            int prevBooks = await _context.Books
                .CountAsync(b => b.Status == "Approved" && b.CreatedAt < startDate);

            double bookChange = CalcChange(totalBooks, prevBooks);

            // ================= 2. SÁCH NÓI =================
            int audioBooks = await _context.Books
                .CountAsync(b =>
                    b.Status == "Approved" &&
                    b.CreatedAt <= endDate &&
                    b.Chapters.Any(c =>
                        c.Status == "Active" &&
                        c.ChapterAudios.Any()));

            int prevAudioBooks = await _context.Books
                .CountAsync(b =>
                    b.Status == "Approved" &&
                    b.CreatedAt < startDate &&
                    b.Chapters.Any(c =>
                        c.Status == "Active" &&
                        c.ChapterAudios.Any()));

            double audioChange = CalcChange(audioBooks, prevAudioBooks);

            // ================= 3. NGƯỜI DÙNG =================
            int owners = await _context.Users
                .CountAsync(u => u.Roles.Any(r => r.RoleName == "Owner") && u.CreatedAt <= endDate);

            int prevOwners = await _context.Users
                .CountAsync(u => u.Roles.Any(r => r.RoleName == "Owner") && u.CreatedAt < startDate);

            double ownerChange = CalcChange(owners, prevOwners);

            int customers = await _context.Users
                .CountAsync(u => u.Roles.Any(r => r.RoleName == "Customer") && u.CreatedAt <= endDate);

            int prevCustomers = await _context.Users
                .CountAsync(u => u.Roles.Any(r => r.RoleName == "Customer") && u.CreatedAt < startDate);

            double customerChange = CalcChange(customers, prevCustomers);

            int staffs = await _context.Users
                .CountAsync(u =>
                    u.Roles.Count == 1 &&
                    u.Roles.Any(r => r.RoleName == "Staff") &&
                    u.CreatedAt <= endDate);

            int prevStaffs = await _context.Users
                .CountAsync(u =>
                    u.Roles.Count == 1 &&
                    u.Roles.Any(r => r.RoleName == "Staff") &&
                    u.CreatedAt < startDate);

            double staffChange = CalcChange(staffs, prevStaffs);

            // ================= 4. GIAO DỊCH (4 BẢNG) =================
            int totalTransactions =
                await _context.OrderItems
                    .CountAsync(o => o.PaidAt <= endDate)
            + await _context.WalletTransactions
                    .CountAsync(t => t.CreatedAt <= endDate)
            + await _context.Subscriptions
                    .CountAsync(s => s.CreatedAt <= endDate)
            + await _context.PaymentRequests
                    .CountAsync(p => p.RequestDate <= endDate);

            int prevTransactions =
                await _context.OrderItems
                    .CountAsync(o => o.PaidAt < startDate)
            + await _context.WalletTransactions
                    .CountAsync(t => t.CreatedAt < startDate)
            + await _context.Subscriptions
                    .CountAsync(s => s.CreatedAt < startDate)
            + await _context.PaymentRequests
                    .CountAsync(p => p.RequestDate < startDate);

            double transactionChange = CalcChange(totalTransactions, prevTransactions);

            // ================= 5. DOANH THU  =================
            decimal totalRevenue =
                await _context.WalletTransactions
                    .Where(t => t.Status == "Succeeded" && t.CreatedAt <= endDate)
                    .SumAsync(t => (decimal?)t.AmountMoney) ?? 0;

            decimal prevRevenue =
                await _context.WalletTransactions
                    .Where(t => t.Status == "Succeeded" && t.CreatedAt < startDate)
                    .SumAsync(t => (decimal?)t.AmountMoney) ?? 0;

            double revenueChange = CalcChange((double)totalRevenue, (double)prevRevenue);
            // ================= 6. FEEDBACK KPI  =================
            int totalReviews = await _context.BookReviews
                .CountAsync(r => r.CreatedAt <= endDate);

            int prevReviews = await _context.BookReviews
                .CountAsync(r => r.CreatedAt < startDate);

            int positiveReviews = await _context.BookReviews
                .CountAsync(r => r.CreatedAt <= endDate && r.Rating >= 3);

            int negativeReviews = await _context.BookReviews
                .CountAsync(r => r.CreatedAt <= endDate && r.Rating < 3);

            double averageRating = totalReviews > 0
                ? await _context.BookReviews
                    .Where(r => r.CreatedAt <= endDate)
                    .AverageAsync(r => r.Rating)
                : 0;

            double positivePercent = totalReviews > 0
                ? Math.Round((double)positiveReviews / totalReviews * 100, 1)
                : 0;

            double negativePercent = totalReviews > 0
                ? Math.Round((double)negativeReviews / totalReviews * 100, 1)
                : 0;

            double feedbackChangePercent =
                CalcChange(totalReviews, prevReviews);

            // ================= 7. BIỂU ĐỒ =================
            var booksByMonthData = await _context.Books
                .Where(b =>
                    b.Status == "Approved" &&
                    b.CreatedAt >= startDate &&
                    b.CreatedAt <= endDate)
                .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .Select(g => new BookByMonthDTO
                {
                    Month = "Th" + g.Key.Month,
                    Books = g.Count()
                })
                .ToListAsync();

            var revenueData = await _context.WalletTransactions
                .Where(t =>
                    t.Status == "Succeeded" &&
                    t.CreatedAt >= startDate &&
                    t.CreatedAt <= endDate)
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .Select(g => new RevenueByMonthDTO
                {
                    Month = "Th" + g.Key.Month,
                    Revenue = g.Sum(x => x.AmountMoney)
                })
                .ToListAsync();

            // ================= 8. CATEGORY =================
            var categoryDistribution = await _context.Categories
            .Select(c => new CategoryDistributionDTO
            {
                Name = c.Name,
                Count = c.Books.Count(b =>
                    b.Status == "Approved" &&
             //       b.CreatedAt >= startDate &&
                    b.CreatedAt <= endDate
                )
            })
            .ToListAsync();

            int totalCategoryBooks = categoryDistribution.Sum(c => c.Count);

            categoryDistribution.ForEach(c =>
            {
                c.Percentage = totalCategoryBooks > 0
                    ? Math.Round((double)c.Count / totalCategoryBooks * 100, 1)
                    : 0;
            });
            // ================= RETURN =================
            return new AdminStatisticDTO
            {
                TotalBooks = totalBooks,
                AudioBooks = audioBooks,
                BookOwners = owners,
                Customers = customers,
                Staffs = staffs,

                MonthlyTransactions = totalTransactions,
                MonthlyRevenue = Math.Round(totalRevenue, 2),

                AverageRating = Math.Round(averageRating, 2),
                PositiveFeedbackPercent = positivePercent,
                NegativeFeedbackPercent = negativePercent,

                BooksChangePercent = bookChange,
                AudioChangePercent = audioChange,
                BookOwnerChangePercent = ownerChange,
                CustomerChangePercent = customerChange,
                StaffChangePercent = staffChange,
                TransactionChangePercent = transactionChange,
                RevenueChangePercent = revenueChange,
                FeedbackChangePercent = feedbackChangePercent,

                BooksByMonthData = booksByMonthData,
                RevenueData = revenueData,
                CategoryDistribution = categoryDistribution
            };
        }
    }
}
