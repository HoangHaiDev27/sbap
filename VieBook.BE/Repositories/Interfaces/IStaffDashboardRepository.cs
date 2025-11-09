using BusinessObject.Dtos;

namespace Repositories.Interfaces
{
    public interface IStaffDashboardRepository
    {
        Task<StaffDashboardStatsDTO> GetStaffStatsAsync();
        Task<List<TopBookDTO>> GetTopBooksAsync(int limit = 5);
        Task<List<TopOwnerDTO>> GetTopOwnersAsync(int limit = 5);
        Task<List<PendingBookDTO>> GetPendingBooksAsync(int limit = 5);
        Task<List<RecentFeedbackDTO>> GetRecentFeedbacksAsync(int limit = 5);
        Task<StaffDashboardDTO> GetStaffDashboardAsync();
    }
}

