using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class PromotionRepository : IPromotionRepository
    {
        private readonly PromotionDAO _promotionDAO;

        public PromotionRepository(PromotionDAO promotionDAO)
        {
            _promotionDAO = promotionDAO;
        }

        public async Task<List<Promotion>> GetPromotionsByOwnerAsync(int ownerId)
        {
            return await _promotionDAO.GetPromotionsByOwnerAsync(ownerId);
        }
        public async Task<Promotion> CreatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            return await _promotionDAO.CreatePromotionAsync(promotion, bookIds);
        }
        public async Task<Promotion?> GetPromotionByIdAsync(int promotionId)
        {
            return await _promotionDAO.GetPromotionByIdAsync(promotionId);
        }

        public async Task<Promotion> UpdatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            return await _promotionDAO.UpdatePromotionAsync(promotion, bookIds);
        }
        public Task<bool> DeletePromotionAsync(int promotionId, int ownerId)
        => _promotionDAO.DeletePromotionAsync(promotionId, ownerId);
    }
}
