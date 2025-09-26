using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class BookWithPromotionDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public int TotalView { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Author { get; set; }
        public int OwnerId { get; set; }
        public string Status { get; set; } = null!;

        // giá trị thêm cho promotion
        public decimal TotalPrice { get; set; }
        public decimal DiscountedPrice { get; set; }

        // thông tin thêm
        public int Sold { get; set; }
        public double Rating { get; set; }
        public string? OwnerName { get; set; }

        // categories
        public List<int> CategoryIds { get; set; } = new();
    }
}
