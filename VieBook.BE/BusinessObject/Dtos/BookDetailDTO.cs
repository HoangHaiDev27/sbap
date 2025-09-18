using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookDetailDTO
    {
        public BookDTO Book { get; set; } = null!;
        public List<ChapterDTO> Chapters { get; set; } = new();
    }
}
