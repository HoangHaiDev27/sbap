using BusinessObject.Models;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IUserFeedbackService
    {
        Task<UserFeedback> SubmitFeedbackAsync(int fromUserId, string content, string targetType, int? targetId);
    }
}
