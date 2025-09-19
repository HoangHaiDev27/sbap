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
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public int TotalView { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Author { get; set; }
        public string Status { get; set; } = null!;
        public string OwnerName { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
        public List<ChapterDTO> Chapters { get; set; } = new();
        public List<BookReviewDTO> Reviews { get; set; } = new();
    }
}
