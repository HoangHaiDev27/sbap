using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class RankingSummaryDTO
    {
        public int PopularCount { get; set; }
        public int TopRatedCount { get; set; }
        public int NewReleaseCount { get; set; }
        public int TrendingCount { get; set; }
    }
}
