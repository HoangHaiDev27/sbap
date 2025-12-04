using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos
{
    public class OwnerDashboardStatsDTO
    {
        public decimal TotalRevenue { get; set; }
        public int TotalChaptersSold { get; set; } // Số chapter đã bán
        public int TotalViews { get; set; }
        public int TotalReviews { get; set; }
    }

    public class RevenueByCategoryDTO
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int BookCount { get; set; }
    }

    public class MonthlySalesDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Sales { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RecentOrderDTO
    {
        public int OrderId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string BookCover { get; set; } = string.Empty;
    }

    public class BestSellerDTO
    {
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int SoldCount { get; set; }
        public decimal Revenue { get; set; }
        public string BookCover { get; set; } = string.Empty;
    }

    public class OwnerDashboardDTO
    {
        public OwnerDashboardStatsDTO Stats { get; set; } = new();
        public List<RevenueByCategoryDTO> RevenueByCategory { get; set; } = new();
        public List<MonthlySalesDTO> MonthlySales { get; set; } = new();
        public List<RecentOrderDTO> RecentOrders { get; set; } = new();
        public List<BestSellerDTO> BestSellers { get; set; } = new();
    }
}
