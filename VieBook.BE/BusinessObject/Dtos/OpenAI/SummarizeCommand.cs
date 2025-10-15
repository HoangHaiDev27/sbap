using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class SummarizeCommand
    {
        public string Content { get; set; } = string.Empty;
        public string ChapterTitle { get; set; } = string.Empty;
    }
}
