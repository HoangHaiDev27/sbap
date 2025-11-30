using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess
{
    public class OwnerDashboardDAO
    {
        private readonly VieBookContext _context;

        public OwnerDashboardDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<OwnerDashboardStatsDTO> GetOwnerStatsAsync(int ownerId)
        {
            var stats = new OwnerDashboardStatsDTO();

            // Total Revenue - từ các OrderItem đã thanh toán của owner
            stats.TotalRevenue = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .SumAsync(oi => oi.CashSpent);

            // Total Chapters Sold - số lượng chapter đã bán (tính theo OrderItem)
            stats.TotalChaptersSold = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .CountAsync();

            // Total Views - tổng lượt xem của tất cả sách của owner (tính từ Chapter.ChapterView)
            stats.TotalViews = await _context.Chapters
                .Where(c => c.Book.OwnerId == ownerId && c.Status == "Active")
                .SumAsync(c => (int?)c.ChapterView) ?? 0;

            // Total Reviews - tổng số đánh giá của tất cả sách của owner
            stats.TotalReviews = await _context.BookReviews
                .Where(br => br.Book.OwnerId == ownerId)
                .CountAsync();

            return stats;
        }

        public async Task<List<RevenueByCategoryDTO>> GetRevenueByCategoryAsync(int ownerId)
        {
            // Lấy dữ liệu thô trước
            var rawData = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                .ThenInclude(c => c.Book)
                .ThenInclude(b => b.Categories)
                .Select(oi => new 
                {
                    Revenue = oi.CashSpent,
                    BookId = oi.Chapter.BookId,
                    Categories = oi.Chapter.Book.Categories
                })
                .ToListAsync();

            // Xử lý trên client
            var revenueByCategory = rawData
                .GroupBy(x => 
                {
                    var firstCategory = x.Categories.FirstOrDefault();
                    return firstCategory?.Name ?? "Không phân loại";
                })
                .Select(g => new RevenueByCategoryDTO
                {
                    CategoryName = g.Key,
                    Revenue = g.Sum(x => x.Revenue),
                    BookCount = g.Select(x => x.BookId).Distinct().Count()
                })
                .OrderByDescending(x => x.Revenue)
                .ToList();

            return revenueByCategory;
        }

        public async Task<List<MonthlySalesDTO>> GetMonthlySalesAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            // Nếu không có startDate, mặc định là 6 tháng trước
            if (!startDate.HasValue)
                startDate = DateTime.Now.AddMonths(-6);
            
            // Nếu không có endDate, mặc định là hiện tại
            if (!endDate.HasValue)
                endDate = DateTime.Now;

            // Validation: Không được vượt quá 12 tháng
            var monthsDifference = ((endDate.Value.Year - startDate.Value.Year) * 12) + endDate.Value.Month - startDate.Value.Month;
            if (monthsDifference > 12)
            {
                throw new ArgumentException("Khoảng thời gian không được vượt quá 12 tháng");
            }

            var monthlySales = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && 
                           oi.PaidAt != null && 
                           oi.PaidAt >= startDate && 
                           oi.PaidAt <= endDate)
                .GroupBy(oi => new { oi.PaidAt!.Value.Year, oi.PaidAt.Value.Month })
                .Select(g => new 
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Sales = g.Count(),
                    Revenue = g.Sum(oi => oi.CashSpent)
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            // Tạo danh sách tất cả các tháng trong khoảng thời gian
            var allMonths = new List<MonthlySalesDTO>();
            var currentDate = new DateTime(startDate.Value.Year, startDate.Value.Month, 1);
            var endDateMonth = new DateTime(endDate.Value.Year, endDate.Value.Month, 1);

            while (currentDate <= endDateMonth)
            {
                var existingData = monthlySales.FirstOrDefault(x => x.Year == currentDate.Year && x.Month == currentDate.Month);
                
                allMonths.Add(new MonthlySalesDTO
                {
                    Month = $"{currentDate.Year}-{currentDate.Month:D2}",
                    Sales = existingData?.Sales ?? 0,
                    Revenue = existingData?.Revenue ?? 0
                });

                currentDate = currentDate.AddMonths(1);
            }

            return allMonths;
        }

        public async Task<List<RecentOrderDTO>> GetRecentOrdersAsync(int ownerId, int limit = 5)
        {
            var recentOrders = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .OrderByDescending(oi => oi.PaidAt)
                .Take(limit)
                .Select(oi => new RecentOrderDTO
                {
                    OrderId = (int)oi.OrderItemId,
                    BookTitle = oi.Chapter.Book.Title,
                    Price = oi.CashSpent,
                    OrderDate = oi.PaidAt!.Value,
                    Status = "Completed", // OrderItem đã thanh toán
                    BookCover = oi.Chapter.Book.CoverUrl
                })
                .ToListAsync();

            return recentOrders;
        }

        public async Task<List<BestSellerDTO>> GetBestSellersAsync(int ownerId, int limit = 5)
        {
            var bestSellers = await _context.OrderItems
                .Where(oi => oi.Chapter.Book.OwnerId == ownerId && oi.PaidAt != null)
                .GroupBy(oi => new { oi.Chapter.BookId, oi.Chapter.Book.Title, oi.Chapter.Book.CoverUrl })
                .Select(g => new BestSellerDTO
                {
                    BookId = g.Key.BookId,
                    BookTitle = g.Key.Title,
                    SoldCount = g.Count(),
                    Revenue = g.Sum(oi => oi.CashSpent),
                    BookCover = g.Key.CoverUrl
                })
                .OrderByDescending(x => x.SoldCount)
                .Take(limit)
                .ToListAsync();

            return bestSellers;
        }

        public async Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId)
        {
            var stats = await GetOwnerStatsAsync(ownerId);
            var revenueByCategory = await GetRevenueByCategoryAsync(ownerId);
            var monthlySales = await GetMonthlySalesAsync(ownerId);
            var recentOrders = await GetRecentOrdersAsync(ownerId);
            var bestSellers = await GetBestSellersAsync(ownerId);

            return new OwnerDashboardDTO
            {
                Stats = stats,
                RevenueByCategory = revenueByCategory,
                MonthlySales = monthlySales,
                RecentOrders = recentOrders,
                BestSellers = bestSellers
            };
        }
    }
}
