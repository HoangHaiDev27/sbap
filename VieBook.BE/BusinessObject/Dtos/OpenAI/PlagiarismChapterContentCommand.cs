using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class PlagiarismChapterContentCommand
    {
        public int BookId { get; set; }
        public int? ChapterId { get; set; } // Optional: để loại trừ chính chapter đó khi edit
        public string content { get; set; }
    }
}