using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class UserBehaviorProfile
    {
        public int UserId { get; set; }
        public List<int> ReadBooks { get; set; } = new List<int>();
        public List<int> BookmarkedBooks { get; set; } = new List<int>();
        public List<int> HighlyRatedBooks { get; set; } = new List<int>();
        public Dictionary<int, double> CategoryPreferences { get; set; } = new Dictionary<int, double>();
        public double AverageRating { get; set; }
        public int TotalBooksRead { get; set; }
        public DateTime LastActiveDate { get; set; }
        public List<string> ReadingPatterns { get; set; } = new List<string>();
    }
}
