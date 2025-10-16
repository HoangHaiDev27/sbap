using BusinessObject.Models;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IUserFeedbackRepository
    {
        Task<UserFeedback> AddAsync(UserFeedback feedback);
    }
}
