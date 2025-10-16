using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
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
    }
}
