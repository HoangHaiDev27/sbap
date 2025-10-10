using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Models
{
    public class ChapterContentEmbedding
    {
        public int ChapterId { get; set; }
        public int BookId { get; set; }
        public string VectorChapterContent { get; set; }
        public DateTime UploadedAt { get; set; }
        public virtual Chapter Chapter { get; set; }
        public virtual Book Book { get; set; }
    }
}