using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class OwnerDashboardService : IOwnerDashboardService
    {
        private readonly IOwnerDashboardRepository _ownerDashboardRepository;

        public OwnerDashboardService(IOwnerDashboardRepository ownerDashboardRepository)
        {
            _ownerDashboardRepository = ownerDashboardRepository;
        }

        public async Task<OwnerDashboardStatsDTO> GetOwnerStatsAsync(int ownerId)
        {
            try
            {
                return await _ownerDashboardRepository.GetOwnerStatsAsync(ownerId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting owner stats: {ex.Message}", ex);
            }
        }

        public async Task<List<RevenueByCategoryDTO>> GetRevenueByCategoryAsync(int ownerId)
        {
            try
            {
                return await _ownerDashboardRepository.GetRevenueByCategoryAsync(ownerId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting revenue by category: {ex.Message}", ex);
            }
        }

        public async Task<List<MonthlySalesDTO>> GetMonthlySalesAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                return await _ownerDashboardRepository.GetMonthlySalesAsync(ownerId, startDate, endDate);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting monthly sales: {ex.Message}", ex);
            }
        }

        public async Task<List<RecentOrderDTO>> GetRecentOrdersAsync(int ownerId, int limit = 10)
        {
            try
            {
                return await _ownerDashboardRepository.GetRecentOrdersAsync(ownerId, limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting recent orders: {ex.Message}", ex);
            }
        }

        public async Task<List<BestSellerDTO>> GetBestSellersAsync(int ownerId, int limit = 5)
        {
            try
            {
                return await _ownerDashboardRepository.GetBestSellersAsync(ownerId, limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting best sellers: {ex.Message}", ex);
            }
        }

        public async Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId)
        {
            try
            {
                return await _ownerDashboardRepository.GetOwnerDashboardAsync(ownerId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting owner dashboard: {ex.Message}", ex);
            }
        }
    }
}

