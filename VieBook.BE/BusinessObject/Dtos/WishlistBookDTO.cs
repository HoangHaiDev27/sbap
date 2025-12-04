namespace BusinessObject.Dtos
{
    public class WishlistBookDTO
    {
        public int BookId { get; set; }
        public int OwnerId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public string Status { get; set; } = null!;
        public int TotalView { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Author { get; set; }
        
        // Related data without circular references
        public List<BookReviewDTO> BookReviews { get; set; } = new List<BookReviewDTO>();
        public List<ChapterDTO> Chapters { get; set; } = new List<ChapterDTO>();
        public List<CategoryDTO> Categories { get; set; } = new List<CategoryDTO>();
        public UserDTO? Owner { get; set; }
        
        // Calculated fields
        public double AverageRating { get; set; }
        public int TotalDurationMinutes { get; set; }
    }
}
