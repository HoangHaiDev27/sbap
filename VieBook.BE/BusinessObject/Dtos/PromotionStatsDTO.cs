namespace BusinessObject.Dtos
{
    public class PromotionStatsDTO
    {
        public int ActiveCount { get; set; }
        public int UpcomingCount { get; set; }
        public int ExpiredCount { get; set; }
        public int TotalPromotions { get; set; }
        public int TotalBooksApplied { get; set; }
        public int TotalUses { get; set; } // hiện chưa theo dõi, trả 0
        public decimal TotalRevenue { get; set; } // hiện chưa theo dõi, trả 0
    }
}


