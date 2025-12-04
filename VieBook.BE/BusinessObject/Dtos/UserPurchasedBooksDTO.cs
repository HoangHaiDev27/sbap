using System;

namespace BusinessObject.Dtos
{
    public class UserPurchasedBooksDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Author { get; set; }
        public int PurchasedChaptersCount { get; set; }
        public int TotalChaptersCount { get; set; }
        public DateTime LastPurchasedAt { get; set; }
        public decimal TotalSpent { get; set; }
    }
}
