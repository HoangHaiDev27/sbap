using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookSearchReponseDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = null!;
        public string? Author { get; set; }
        public string? CoverImageUrl { get; set; }
    }
}