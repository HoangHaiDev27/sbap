namespace BusinessObject.Dtos
{
    public class StaffDashboardStatsDTO
    {
        public int TotalBooks { get; set; }
        public int BookOwners { get; set; }
        public int Customers { get; set; }
        public int PendingBooks { get; set; }
        public int PendingWithdrawals { get; set; }
        public int TodayWalletTransactions { get; set; }
        public int NewReviewsLast7Days { get; set; }
        public int ActiveSubscriptions { get; set; }
    }

    public class TopBookDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int SalesCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class TopOwnerDTO
    {
        public int OwnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int BookCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class PendingBookDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class RecentFeedbackDTO
    {
        public int FeedbackId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string TargetType { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class StaffDashboardDTO
    {
        public StaffDashboardStatsDTO Stats { get; set; } = new();
        public List<TopBookDTO> TopBooks { get; set; } = new();
        public List<TopOwnerDTO> TopOwners { get; set; } = new();
    }
}

