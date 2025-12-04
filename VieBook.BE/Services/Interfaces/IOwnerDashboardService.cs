using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IOwnerDashboardService
    {
        Task<OwnerDashboardStatsDTO> GetOwnerStatsAsync(int ownerId);
        Task<List<RevenueByCategoryDTO>> GetRevenueByCategoryAsync(int ownerId);
        Task<List<MonthlySalesDTO>> GetMonthlySalesAsync(int ownerId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<RecentOrderDTO>> GetRecentOrdersAsync(int ownerId, int limit = 10);
        Task<List<BestSellerDTO>> GetBestSellersAsync(int ownerId, int limit = 5);
        Task<OwnerDashboardDTO> GetOwnerDashboardAsync(int ownerId);
    }
}

