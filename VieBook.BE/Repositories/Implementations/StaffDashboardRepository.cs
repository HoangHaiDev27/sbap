using BusinessObject.Dtos;
using DataAccess;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class StaffDashboardRepository : IStaffDashboardRepository
    {
        private readonly StaffDashboardDAO _dao;

        public StaffDashboardRepository(StaffDashboardDAO dao)
        {
            _dao = dao;
        }

        public async Task<StaffDashboardStatsDTO> GetStaffStatsAsync()
        {
            return await _dao.GetStaffStatsAsync();
        }

        public async Task<List<TopBookDTO>> GetTopBooksAsync(int limit = 5)
        {
            return await _dao.GetTopBooksAsync(limit);
        }

        public async Task<List<TopOwnerDTO>> GetTopOwnersAsync(int limit = 5)
        {
            return await _dao.GetTopOwnersAsync(limit);
        }

        public async Task<List<PendingBookDTO>> GetPendingBooksAsync(int limit = 3)
        {
            return await _dao.GetPendingBooksAsync(limit);
        }

        public async Task<List<RecentFeedbackDTO>> GetRecentFeedbacksAsync(int limit = 5)
        {
            return await _dao.GetRecentFeedbacksAsync(limit);
        }

        public async Task<StaffDashboardDTO> GetStaffDashboardAsync()
        {
            return await _dao.GetStaffDashboardAsync();
        }
    }
}

