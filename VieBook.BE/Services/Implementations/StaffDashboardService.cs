using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class StaffDashboardService : IStaffDashboardService
    {
        private readonly IStaffDashboardRepository _staffDashboardRepository;

        public StaffDashboardService(IStaffDashboardRepository staffDashboardRepository)
        {
            _staffDashboardRepository = staffDashboardRepository;
        }

        public async Task<StaffDashboardStatsDTO> GetStaffStatsAsync()
        {
            try
            {
                return await _staffDashboardRepository.GetStaffStatsAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting staff stats: {ex.Message}", ex);
            }
        }

        public async Task<List<TopBookDTO>> GetTopBooksAsync(int limit = 5)
        {
            try
            {
                return await _staffDashboardRepository.GetTopBooksAsync(limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting top books: {ex.Message}", ex);
            }
        }

        public async Task<List<TopOwnerDTO>> GetTopOwnersAsync(int limit = 5)
        {
            try
            {
                return await _staffDashboardRepository.GetTopOwnersAsync(limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting top owners: {ex.Message}", ex);
            }
        }

        public async Task<List<PendingBookDTO>> GetPendingBooksAsync(int limit = 3)
        {
            try
            {
                return await _staffDashboardRepository.GetPendingBooksAsync(limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting pending books: {ex.Message}", ex);
            }
        }

        public async Task<List<RecentFeedbackDTO>> GetRecentFeedbacksAsync(int limit = 5)
        {
            try
            {
                return await _staffDashboardRepository.GetRecentFeedbacksAsync(limit);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting recent feedbacks: {ex.Message}", ex);
            }
        }

        public async Task<StaffDashboardDTO> GetStaffDashboardAsync()
        {
            try
            {
                return await _staffDashboardRepository.GetStaffDashboardAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting staff dashboard: {ex.Message}", ex);
            }
        }
    }
}

