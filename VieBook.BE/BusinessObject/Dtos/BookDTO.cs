using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookDTO
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
        // Author info
        public string? OwnerName { get; set; }

        // Categories
        public List<int> CategoryIds { get; set; } = new();
    }
}
