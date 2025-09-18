using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class AuthenRepository : IAuthenRepository
    {
        private readonly AuthenDAO _authDAO;
        public AuthenRepository(AuthenDAO authDAO) => _authDAO = authDAO;

        public Task<User?> GetByEmailAsync(string email) => _authDAO.GetByEmailAsync(email);
        public Task<User?> GetByIdAsync(int id) => _authDAO.GetByIdAsync(id);
        public Task UpdateAsync(User user) => _authDAO.UpdateAsync(user);
    }
}
