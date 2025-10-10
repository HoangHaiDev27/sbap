using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Models
{
    public class BookEmbedding
    {
        public int BookId { get; set; }
        public string VectorBook { get; set; }
        public string Categories { get; set; }
        public DateTime UploadedAt { get; set; }
        public virtual Book Book { get; set; }
    }
}