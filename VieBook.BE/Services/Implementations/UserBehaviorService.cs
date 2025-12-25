using BusinessObject.Models;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;

namespace Services.Implementations
{
    public class UserBehaviorService : IUserBehaviorService
    {
        private readonly IOpenAIService _openAIService;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly IBookReviewRepository _bookReviewRepository;
        private readonly IBookmarkRepository _bookmarkRepository;
        private readonly IReadingHistoryRepository _readingHistoryRepository;
        private readonly IBookRepository _bookRepository;

        public UserBehaviorService(
            IOpenAIService openAIService,
            IOrderItemRepository orderItemRepository,
            IBookReviewRepository bookReviewRepository,
            IBookmarkRepository bookmarkRepository,
            IReadingHistoryRepository readingHistoryRepository,
            IBookRepository bookRepository)
        {
            _openAIService = openAIService;
            _orderItemRepository = orderItemRepository;
            _bookReviewRepository = bookReviewRepository;
            _bookmarkRepository = bookmarkRepository;
            _readingHistoryRepository = readingHistoryRepository;
            _bookRepository = bookRepository;
        }

        public async Task<UserBehaviorData> GetUserBehaviorDataAsync(int userId)
        {
            var behaviorData = new UserBehaviorData { UserId = userId };

            // Get purchased books (read books)
            var orderItems = await _orderItemRepository.GetPurchasedBooksByUserIdAsync(userId);
            foreach (var item in orderItems)
            {
                var bookId = item.Chapter?.BookId;
                if (bookId.HasValue)
                {
                    behaviorData.BookReadDates[bookId.Value] = item.PaidAt ?? DateTime.UtcNow;
                }
            }

            // Get book ratings
            var reviews = await _bookReviewRepository.GetReviewsByUserIdAsync(userId);
            foreach (var review in reviews)
            {
                behaviorData.BookRatings[review.BookId] = review.Rating;
            }

            // Get bookmarked books
            var bookmarks = await _bookmarkRepository.GetBookmarksByUserIdAsync(userId);
            behaviorData.BookmarkedBooks = bookmarks.Select(b => b.BookId).ToHashSet();

            // Get reading history for duration analysis
            var readingHistory = await _readingHistoryRepository.GetByUserIdAsync(userId);
            foreach (var history in readingHistory)
            {
                if (history.BookId != null)
                {
                    // Use LastReadAt as a proxy for reading duration/engagement
                    var duration = DateTime.UtcNow - history.LastReadAt;
                    behaviorData.ReadingDurations[history.BookId] = duration;
                }
            }

            // Analyze category interactions
            var userBooks = await _bookRepository.GetBooksByIdsAsync(
                behaviorData.BookReadDates.Keys.Concat(behaviorData.BookRatings.Keys).ToList());
            
            foreach (var book in userBooks)
            {
                foreach (var category in book.Categories)
                {
                    behaviorData.CategoryInteractions[category.CategoryId] = 
                        behaviorData.CategoryInteractions.GetValueOrDefault(category.CategoryId, 0) + 1;
                }
            }

            return behaviorData;
        }

        public async Task<UserBehaviorProfile> AnalyzeUserBehaviorAsync(int userId)
        {
            var behaviorData = await GetUserBehaviorDataAsync(userId);
            var profile = new UserBehaviorProfile { UserId = userId };

            // Basic metrics
            profile.ReadBooks = behaviorData.BookReadDates.Keys.ToList();
            profile.BookmarkedBooks = behaviorData.BookmarkedBooks.ToList();
            profile.HighlyRatedBooks = behaviorData.BookRatings
                .Where(x => x.Value >= 4)
                .Select(x => x.Key)
                .ToList();
            profile.TotalBooksRead = behaviorData.BookReadDates.Count;
            profile.AverageRating = behaviorData.BookRatings.Any() 
                ? behaviorData.BookRatings.Values.Average() 
                : 0;

            // Calculate category preferences
            var totalInteractions = behaviorData.CategoryInteractions.Values.Sum();
            foreach (var category in behaviorData.CategoryInteractions)
            {
                profile.CategoryPreferences[category.Key] = (double)category.Value / totalInteractions;
            }

            // Last activity
            profile.LastActiveDate = behaviorData.BookReadDates.Values.Any() 
                ? behaviorData.BookReadDates.Values.Max() 
                : DateTime.MinValue;

            // Use AI to analyze reading patterns
            profile.ReadingPatterns = await AnalyzeReadingPatternsWithAI(behaviorData);

            return profile;
        }

        public async Task<List<UserSimilarity>> CalculateUserSimilaritiesAsync(int userId)
        {
            var targetUserBehavior = await GetUserBehaviorDataAsync(userId);
            var allUsers = await GetAllActiveUserIds();
            var similarities = new List<UserSimilarity>();

            foreach (var otherUserId in allUsers.Where(u => u != userId))
            {
                var otherUserBehavior = await GetUserBehaviorDataAsync(otherUserId);
                var similarity = await CalculateUserSimilarity(targetUserBehavior, otherUserBehavior);
                
                if (similarity.SimilarityScore > 0.1) // Only keep meaningful similarities
                {
                    similarities.Add(similarity);
                }
            }

            return similarities.OrderByDescending(s => s.SimilarityScore).ToList();
        }

        public async Task<List<int>> FindSimilarUsersAsync(int userId, int topCount = 50)
        {
            var similarities = await CalculateUserSimilaritiesAsync(userId);
            return similarities.Take(topCount).Select(s => s.UserId).ToList();
        }

        public async Task<List<Book>> GetCollaborativeRecommendationsAsync(int userId, int topCount = 10)
        {
            // 1. Find similar users
            var similarUsers = await FindSimilarUsersAsync(userId, 30);
            if (!similarUsers.Any())
            {
                return await GetFallbackRecommendations(userId, topCount);
            }

            // 2. Get books read by similar users but not by target user
            var targetUserBooks = (await GetUserBehaviorDataAsync(userId)).BookReadDates.Keys.ToHashSet();
            var candidateBooks = new Dictionary<int, double>();

            foreach (var similarUserId in similarUsers)
            {
                var similarUserBehavior = await GetUserBehaviorDataAsync(similarUserId);
                var similarityScore = (await CalculateUserSimilaritiesAsync(userId))
                    .First(s => s.UserId == similarUserId).SimilarityScore;

                foreach (var bookId in similarUserBehavior.BookReadDates.Keys)
                {
                    if (!targetUserBooks.Contains(bookId))
                    {
                        // Weight by similarity score and user rating
                        var weight = similarityScore;
                        if (similarUserBehavior.BookRatings.TryGetValue(bookId, out var rating))
                        {
                            weight *= (rating / 5.0); // Normalize rating to 0-1
                        }
                        
                        candidateBooks[bookId] = candidateBooks.GetValueOrDefault(bookId, 0) + weight;
                    }
                }
            }

            // 3. Use AI to refine recommendations based on patterns
            var refinedRecommendations = await RefineRecommendationsWithAI(userId, candidateBooks);

            // 4. Get top recommended books
            var topBookIds = refinedRecommendations
                .OrderByDescending(x => x.Value)
                .Take(topCount)
                .Select(x => x.Key)
                .ToList();

            return await _bookRepository.GetBooksByIdsAsync(topBookIds);
        }

        private async Task<List<string>> AnalyzeReadingPatternsWithAI(UserBehaviorData behaviorData)
        {
            try
            {
                var prompt = $@"
Phân tích hành vi đọc sách của người dùng và đưa ra các pattern nhận diện được:

Dữ liệu người dùng:
- Số sách đã đọc: {behaviorData.BookReadDates.Count}
- Số sách đánh giá: {behaviorData.BookRatings.Count}
- Số sách bookmark: {behaviorData.BookmarkedBooks.Count}
- Đánh giá trung bình: {(behaviorData.BookRatings.Any() ? behaviorData.BookRatings.Values.Average().ToString("F1") : "N/A")}
- Thể loại yêu thích: {string.Join(", ", behaviorData.CategoryInteractions.OrderByDescending(x => x.Value).Take(3).Select(x => $"Category {x.Key} ({x.Value} lần)"))}

Hãy phân tích và trả về 5 pattern chính dưới dạng JSON array:
[
    ""pattern 1"",
    ""pattern 2"",
    ""pattern 3"",
    ""pattern 4"",
    ""pattern 5""
]

Các pattern có thể là:
- Thời gian đọc (sáng/tối/weekend)
- Thể loại ưu tiên
- Tần suất đọc
- Xu hướng đánh giá
- Mức độ bookmark
- Thời lượng đọc trung bình
- v.v.

Chỉ trả về JSON array, không thêm giải thích.";

                var response = await CallOpenAIForPatternAnalysis(prompt);
                return ParsePatternResponse(response);
            }
            catch
            {
                return new List<string>
                {
                    "Người đọc thường xuyên",
                    "Thích đa dạng thể loại",
                    "Có xu hướng đánh giá cao",
                    "Thường bookmark sách hay",
                    "Đọc đều đặn"
                };
            }
        }

        private async Task<UserSimilarity> CalculateUserSimilarity(UserBehaviorData user1, UserBehaviorData user2)
        {
            var similarity = new UserSimilarity { UserId = user2.UserId };

            // 1. Common books analysis
            var commonBooks = user1.BookReadDates.Keys.Intersect(user2.BookReadDates.Keys).ToList();
            similarity.CommonBooks = commonBooks;

            // 2. Rating correlation
            var commonRatings = new List<(double rating1, double rating2)>();
            foreach (var bookId in commonBooks)
            {
                if (user1.BookRatings.TryGetValue(bookId, out var rating1) &&
                    user2.BookRatings.TryGetValue(bookId, out var rating2))
                {
                    commonRatings.Add((rating1, rating2));
                }
            }

            similarity.RatingCorrelation = commonRatings.Count >= 2 
                ? CalculatePearsonCorrelation(commonRatings) 
                : 0;

            // 3. Category overlap
            var categoryOverlap = user1.CategoryInteractions.Keys
                .Intersect(user2.CategoryInteractions.Keys)
                .Count();
            var totalCategories = user1.CategoryInteractions.Keys
                .Union(user2.CategoryInteractions.Keys)
                .Count();
            similarity.CategoryOverlap = totalCategories > 0 ? (double)categoryOverlap / totalCategories : 0;

            // 4. Overall similarity score (weighted combination)
            var commonBooksWeight = 0.4;
            var ratingWeight = 0.3;
            var categoryWeight = 0.3;

            similarity.SimilarityScore = 
                (commonBooks.Count / Math.Max(user1.BookReadDates.Count, user2.BookReadDates.Count)) * commonBooksWeight +
                Math.Abs(similarity.RatingCorrelation) * ratingWeight +
                similarity.CategoryOverlap * categoryWeight;

            return similarity;
        }

        private async Task<Dictionary<int, double>> RefineRecommendationsWithAI(int userId, Dictionary<int, double> candidateBooks)
        {
            try
            {
                var userProfile = await AnalyzeUserBehaviorAsync(userId);
                var topCandidates = candidateBooks.OrderByDescending(x => x.Value).Take(20).ToList();

                var prompt = $@"
Dựa trên hồ sơ người dùng và các sách ứng viên, hãy tinh chỉnh điểm số gợi ý:

Hồ sơ người dùng:
- Pattern: {string.Join(", ", userProfile.ReadingPatterns)}
- Thể loại yêu thích: {string.Join(", ", userProfile.CategoryPreferences.OrderByDescending(x => x.Value).Take(3).Select(x => $"Category {x.Key} ({x.Value:P1})"))}
- Đánh giá trung bình: {userProfile.AverageRating:F1}
- Số sách đã đọc: {userProfile.TotalBooksRead}

Các sách ứng viên với điểm số ban đầu:
{string.Join("\n", topCandidates.Select(x => $"Book {x.Key}: {x.Value:F2}"))}

Hãy phân tích và tinh chỉnh điểm số dựa trên:
1. Mức độ phù hợp với pattern người dùng
2. Sự liên quan đến thể loại yêu thích
3. Khả năng người dùng sẽ thích sách này

Trả về JSON object với bookId và điểm tinh chỉnh:
{{""bookId1"": score1, ""bookId2"": score2, ...}}

Chỉ trả về JSON, không thêm giải thích.";

                var response = await CallOpenAIForRefinement(prompt);
                return ParseRefinementResponse(response, candidateBooks);
            }
            catch
            {
                return candidateBooks; // Fallback to original scores
            }
        }

        private async Task<string> CallOpenAIForPatternAnalysis(string prompt)
        {
            // Placeholder implementation - would call actual OpenAI service
            await Task.Delay(100); // Simulate async operation
            return "[]";
        }

        private async Task<string> CallOpenAIForRefinement(string prompt)
        {
            // Placeholder implementation - would call actual OpenAI service
            await Task.Delay(100); // Simulate async operation
            return "{}";
        }

        private List<string> ParsePatternResponse(string response)
        {
            try
            {
                return JsonConvert.DeserializeObject<List<string>>(response) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private Dictionary<int, double> ParseRefinementResponse(string response, Dictionary<int, double> originalScores)
        {
            try
            {
                var refined = JsonConvert.DeserializeObject<Dictionary<int, double>>(response);
                if (refined != null)
                {
                    // Merge with original scores, giving more weight to AI refinement
                    var result = new Dictionary<int, double>();
                    foreach (var kvp in originalScores)
                    {
                        result[kvp.Key] = refined.GetValueOrDefault(kvp.Key, kvp.Value);
                    }
                    return result;
                }
            }
            catch
            {
                // Fallback to original scores
            }
            return originalScores;
        }

        private double CalculatePearsonCorrelation(List<(double rating1, double rating2)> ratings)
        {
            if (ratings.Count < 2) return 0;

            var avg1 = ratings.Average(x => x.rating1);
            var avg2 = ratings.Average(x => x.rating2);

            var numerator = ratings.Sum(x => (x.rating1 - avg1) * (x.rating2 - avg2));
            var denominator1 = ratings.Sum(x => Math.Pow(x.rating1 - avg1, 2));
            var denominator2 = ratings.Sum(x => Math.Pow(x.rating2 - avg2, 2));

            var denominator = Math.Sqrt(denominator1 * denominator2);

            return denominator == 0 ? 0 : numerator / denominator;
        }

        private async Task<List<int>> GetAllActiveUserIds()
        {
            // Get users who have reading activity in the last 6 months
            var cutoffDate = DateTime.UtcNow.AddMonths(-6);
            var activeUsers = await _orderItemRepository.GetActiveUserIdsSinceAsync(cutoffDate);
            return activeUsers.Distinct().ToList();
        }

        private async Task<List<Book>> GetFallbackRecommendations(int userId, int topCount)
        {
            // Fallback to popular books in user's preferred categories
            var userProfile = await AnalyzeUserBehaviorAsync(userId);
            var preferredCategories = userProfile.CategoryPreferences
                .OrderByDescending(x => x.Value)
                .Take(3)
                .Select(x => x.Key)
                .ToList();

            return await _bookRepository.GetTopBooksByCategoriesAsync(preferredCategories, topCount);
        }
    }
}
