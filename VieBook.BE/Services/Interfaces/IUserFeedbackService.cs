using BusinessObject.Dtos;
using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IUserFeedbackService
    {
        Task<UserFeedback> SubmitFeedbackAsync(int fromUserId, string content, string targetType, int? targetId);
        Task<List<UserFeedbackDTO>> GetAllForStaffAsync();
        Task<(List<UserFeedbackDTO> Feedbacks, int TotalCount)> GetAllForStaffPagedAsync(int page = 1, int pageSize = 10, string? searchTerm = null, int? bookId = null);
        Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null);
        Task<bool> DeleteAsync(int feedbackId, int? deletedBy = null);
    }
}
