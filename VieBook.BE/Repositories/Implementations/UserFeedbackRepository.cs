using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class UserFeedbackRepository : IUserFeedbackRepository
    {
        private readonly UserFeedbackDAO _userFeedbackDAO;

        public UserFeedbackRepository(UserFeedbackDAO userFeedbackDAO)
        {
            _userFeedbackDAO = userFeedbackDAO;
        }

        public Task<UserFeedback> AddAsync(UserFeedback feedback)
            => _userFeedbackDAO.AddAsync(feedback);

        public Task<List<UserFeedbackDTO>> GetAllForStaffAsync()
            => _userFeedbackDAO.GetAllForStaffAsync();

        public Task<(List<UserFeedbackDTO> Feedbacks, int TotalCount)> GetAllForStaffPagedAsync(int page = 1, int pageSize = 10, string? searchTerm = null, int? bookId = null)
            => _userFeedbackDAO.GetAllForStaffPagedAsync(page, pageSize, searchTerm, bookId);

        public Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null)
            => _userFeedbackDAO.GetTotalCountForStaffAsync(searchTerm, bookId);

        public Task<bool> DeleteAsync(int feedbackId, int? deletedBy = null)
            => _userFeedbackDAO.DeleteAsync(feedbackId, deletedBy);
    }
}
