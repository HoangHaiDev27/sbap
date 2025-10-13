using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class GenerateEmbeddingsCommand
    {
        public int ChapterId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
