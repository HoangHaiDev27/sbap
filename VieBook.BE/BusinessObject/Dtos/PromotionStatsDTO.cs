namespace BusinessObject.Dtos
{
    public class PromotionStatsDTO
    {
        public int ActiveCount { get; set; }
        public int UpcomingCount { get; set; }
        public int ExpiredCount { get; set; }
        public int TotalPromotions { get; set; }
        public int TotalBooksApplied { get; set; }
        public int TotalUses { get; set; } // Số lượt sử dụng khuyến mãi (từ OrderItem.PromotionId)
        public decimal TotalRevenue { get; set; } // Tổng doanh thu từ khuyến mãi (từ OrderItem.CashSpent)
    }
}


