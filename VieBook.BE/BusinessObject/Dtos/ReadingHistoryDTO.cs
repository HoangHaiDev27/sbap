using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos
{
    public class ReadingHistoryDTO
    {
        public long ReadingHistoryId { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public int? ChapterId { get; set; }
        public string ReadingType { get; set; } = string.Empty;
        public int? AudioPosition { get; set; }
        public DateTime LastReadAt { get; set; }
        
        // Thông tin bổ sung từ các bảng liên quan
        public string? BookTitle { get; set; }
        public string? ChapterTitle { get; set; }
        public string? CoverUrl { get; set; }
        public string? Author { get; set; }
    }

    public class CreateReadingHistoryDTO
    {
        [Required]
        public int BookId { get; set; }

        public int? ChapterId { get; set; }

        [Required]
        [StringLength(20)]
        public string ReadingType { get; set; } = string.Empty;

        public int? AudioPosition { get; set; }
    }

    public class UpdateReadingHistoryDTO
    {
        [Required]
        public long ReadingHistoryId { get; set; }

        public int? ChapterId { get; set; }

        public int? AudioPosition { get; set; }
    }

    public class ReadingHistoryResponseDTO
    {
        public long ReadingHistoryId { get; set; }
        public int BookId { get; set; }
        public int? ChapterId { get; set; }
        public string ReadingType { get; set; } = string.Empty;
        public int? AudioPosition { get; set; }
        public DateTime LastReadAt { get; set; }
        
        // Thông tin sách
        public string BookTitle { get; set; } = string.Empty;
        public string? CoverUrl { get; set; }
        public string? Author { get; set; }
        
        // Thông tin chương
        public string? ChapterTitle { get; set; }
        public int? TotalPages { get; set; }
        public int? AudioDuration { get; set; }
    }

    public class ReadingHistoryFilterDTO
    {
        public int? BookId { get; set; }
        public int? ChapterId { get; set; }
        public string? ReadingType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
