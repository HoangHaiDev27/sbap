using System;

namespace BusinessObject.Dtos
{
    public class PurchasedBookDTO
    {
        public long OrderItemId { get; set; }
        public int BookId { get; set; }
        public string Title { get; set; } = null!;
        public string? Author { get; set; }
        public string? CoverUrl { get; set; }
        public string? Category { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal CashSpent { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? OrderType { get; set; }
        public string? Format { get; set; }
        public string? Duration { get; set; }
        public string? Size { get; set; }
        public double? Rating { get; set; }
        public int Downloads { get; set; }
        public string Status { get; set; } = "available";
        public int PurchasedChapters { get; set; }
        public int TotalChapters { get; set; }
    }
}
