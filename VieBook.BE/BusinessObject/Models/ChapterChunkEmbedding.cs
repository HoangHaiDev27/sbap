using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Models
{
    public class ChapterChunkEmbedding
    {
        public int ChunkId { get; set; }

        public int ChapterId { get; set; }

        public int BookId { get; set; }

        public int ChunkIndex { get; set; }

        public string VectorChunkContent { get; set; }

        public DateTime CreatedAt { get; set; }

        public virtual Chapter Chapter { get; set; }
        public virtual Book Book { get; set; }
    }
}