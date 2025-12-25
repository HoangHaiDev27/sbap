using BusinessObject.Models;
using BusinessObject.Dtos;
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
}
