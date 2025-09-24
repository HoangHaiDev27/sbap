using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class PromotionService : IPromotionService
    {
        private readonly IPromotionRepository _promotionRepository;

        public PromotionService(IPromotionRepository promotionRepository)
        {
            _promotionRepository = promotionRepository;
        }

        public async Task<List<Promotion>> GetPromotionsByOwnerAsync(int ownerId)
        {
            return await _promotionRepository.GetPromotionsByOwnerAsync(ownerId);
        }
        public async Task<Promotion> CreatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            return await _promotionRepository.CreatePromotionAsync(promotion, bookIds);
        }
        public async Task<Promotion?> GetPromotionByIdAsync(int promotionId)
        {
            return await _promotionRepository.GetPromotionByIdAsync(promotionId);
        }

        public async Task<Promotion> UpdatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            return await _promotionRepository.UpdatePromotionAsync(promotion, bookIds);
        }

    }
}
