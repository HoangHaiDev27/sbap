using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
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
    }
}
