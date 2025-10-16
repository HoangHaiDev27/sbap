using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class CheckSpellingDto
    {
        public string Content { get; set; } = string.Empty;
    }

    public class CheckMeaningDto
    {
        public string Content { get; set; } = string.Empty;
    }
}