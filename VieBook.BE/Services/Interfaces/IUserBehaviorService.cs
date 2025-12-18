using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IUserBehaviorService
    {
        Task<UserBehaviorProfile> AnalyzeUserBehaviorAsync(int userId);
        Task<List<int>> FindSimilarUsersAsync(int userId, int topCount = 50);
        Task<List<Book>> GetCollaborativeRecommendationsAsync(int userId, int topCount = 10);
        Task<UserBehaviorData> GetUserBehaviorDataAsync(int userId);
        Task<List<UserSimilarity>> CalculateUserSimilaritiesAsync(int userId);
    }

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

    public class UserBehaviorData
    {
        public int UserId { get; set; }
        public Dictionary<int, int> BookRatings { get; set; } = new Dictionary<int, int>();
        public Dictionary<int, DateTime> BookReadDates { get; set; } = new Dictionary<int, DateTime>();
        public HashSet<int> BookmarkedBooks { get; set; } = new HashSet<int>();
        public Dictionary<int, TimeSpan> ReadingDurations { get; set; } = new Dictionary<int, TimeSpan>();
        public Dictionary<int, int> CategoryInteractions { get; set; } = new Dictionary<int, int>();
    }

    public class UserSimilarity
    {
        public int UserId { get; set; }
        public double SimilarityScore { get; set; }
        public List<int> CommonBooks { get; set; } = new List<int>();
        public double RatingCorrelation { get; set; }
        public double CategoryOverlap { get; set; }
    }
}
