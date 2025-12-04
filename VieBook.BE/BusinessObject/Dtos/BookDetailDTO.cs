using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookDetailDTO
    {
        public int BookId { get; set; }
        public int OwnerId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public int TotalView { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Author { get; set; }
        public string Status { get; set; } = null!;
        public string? UploadStatus { get; set; }
        public string? CompletionStatus { get; set; }
        public string? UploaderType { get; set; }
        public string? CertificateUrl { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public List<ChapterDTO> Chapters { get; set; } = new();
        public List<BookReviewDTO> Reviews { get; set; } = new();
        public decimal TotalPrice { get; set; }
        
        // Promotion information (only Percent discount supported)
        public bool HasPromotion { get; set; }
        public string? PromotionName { get; set; }
        public string? DiscountType { get; set; } // Always "Percent"
        public decimal? DiscountValue { get; set; } // Percent value (e.g., 10, 20, 50)
        public decimal? DiscountedPrice { get; set; }
    }
}
