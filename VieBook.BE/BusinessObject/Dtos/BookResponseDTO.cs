using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Category { get; set; }
        public double Rating { get; set; }
        public int Reviews { get; set; } // số lượng review
        public decimal Price { get; set; } // tổng giá audio
        public string Duration { get; set; } // tổng thời lượng dạng "7h 30m"
        public int Chapters { get; set; } // số lượng chương
        public string Image { get; set; } // CoverUrl
        public string Description { get; set; }
        public string? Narrator { get; set; }
        public List<string> Categories { get; set; }
    }
}
