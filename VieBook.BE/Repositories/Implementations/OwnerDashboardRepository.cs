using BusinessObject.Dtos;
using DataAccess;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class OwnerDashboardRepository : IOwnerDashboardRepository
    {
        private readonly OwnerDashboardDAO _dao;

        public OwnerDashboardRepository(VieBookContext context)
        {
            _dao = new OwnerDashboardDAO(context);
        }

        public async Task<OwnerDashboardStatsDTO> GetOwnerStatsAsync(int ownerId)
        {
            return await _dao.GetOwnerStatsAsync(ownerId);
        }

        public async Task<List<RevenueByCategoryDTO>> GetRevenueByCategoryAsync(int ownerId)
        {
            return await _dao.GetRevenueByCategoryAsync(ownerId);
        }

        public async Task<List<MonthlySalesDTO>> GetMonthlySalesAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            return await _dao.GetMonthlySalesAsync(ownerId, startDate, endDate);
        }

        public async Task<List<RecentOrderDTO>> GetRecentOrdersAsync(int ownerId, int limit = 10)
        {
            return await _dao.GetRecentOrdersAsync(ownerId, limit);
        }

        public async Task<List<BestSellerDTO>> GetBestSellersAsync(int ownerId, int limit = 5)
        {
            return await _dao.GetBestSellersAsync(ownerId, limit);
        }

        public async Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId)
        {
            return await _dao.GetOwnerDashboardAsync(ownerId);
        }
    }
}

