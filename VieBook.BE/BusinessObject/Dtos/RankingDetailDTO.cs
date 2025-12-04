using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class RankingDetailDTO
    {
        public List<BookDTO> PopularBooks { get; set; } = new();
        public List<BookDTO> TopRatedBooks { get; set; } = new();
        public List<BookDTO> NewReleaseBooks { get; set; } = new();
        public List<BookDTO> TrendingBooks { get; set; } = new();
    }
}
