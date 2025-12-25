using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class UserBehaviorData
    {
        public int UserId { get; set; }
        public Dictionary<int, int> BookRatings { get; set; } = new Dictionary<int, int>();
        public Dictionary<int, DateTime> BookReadDates { get; set; } = new Dictionary<int, DateTime>();
        public HashSet<int> BookmarkedBooks { get; set; } = new HashSet<int>();
        public Dictionary<int, TimeSpan> ReadingDurations { get; set; } = new Dictionary<int, TimeSpan>();
        public Dictionary<int, int> CategoryInteractions { get; set; } = new Dictionary<int, int>();
    }
}
