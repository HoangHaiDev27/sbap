using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IPromotionRepository
    {
        Task<List<Promotion>> GetPromotionsByOwnerAsync(int ownerId);
        Task<List<Promotion>> GetInactivePromotionsByOwnerAsync(int ownerId);
        Task<Promotion> CreatePromotionAsync(Promotion promotion, List<int> bookIds);
        Task<Promotion?> GetPromotionByIdAsync(int promotionId);
        Task<Promotion> UpdatePromotionAsync(Promotion promotion, List<int> bookIds);
        Task<bool> DeletePromotionAsync(int promotionId, int ownerId);
        Task<BusinessObject.Dtos.PromotionStatsDTO> GetStatsByOwnerAsync(int ownerId);
        
        /// <summary>
        /// Lấy các promotions bắt đầu trong ngày hôm nay
        /// </summary>
        Task<List<Promotion>> GetPromotionsStartingTodayAsync();
    }
}
