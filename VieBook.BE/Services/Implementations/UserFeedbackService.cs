using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class UserFeedbackService : IUserFeedbackService
    {
        private readonly IUserFeedbackRepository _userFeedbackRepository;

        public UserFeedbackService(IUserFeedbackRepository userFeedbackRepository)
        {
            _userFeedbackRepository = userFeedbackRepository;
        }

        public async Task<UserFeedback> SubmitFeedbackAsync(int fromUserId, string content, string targetType, int? targetId)
        {
            var feedback = new UserFeedback
            {
                FromUserId = fromUserId,
                Content = content,
                TargetType = targetType,
                TargetId = targetId,
                CreatedAt = DateTime.UtcNow
            };

            return await _userFeedbackRepository.AddAsync(feedback);
        }

        public Task<List<UserFeedbackDTO>> GetAllForStaffAsync()
            => _userFeedbackRepository.GetAllForStaffAsync();

        public Task<(List<UserFeedbackDTO> Feedbacks, int TotalCount)> GetAllForStaffPagedAsync(int page = 1, int pageSize = 10, string? searchTerm = null, int? bookId = null)
            => _userFeedbackRepository.GetAllForStaffPagedAsync(page, pageSize, searchTerm, bookId);

        public Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null)
            => _userFeedbackRepository.GetTotalCountForStaffAsync(searchTerm, bookId);

        public Task<bool> DeleteAsync(int feedbackId, int? deletedBy = null)
            => _userFeedbackRepository.DeleteAsync(feedbackId, deletedBy);
    }
}
