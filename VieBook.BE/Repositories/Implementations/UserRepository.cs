using BusinessObject;
using BusinessObject.Models;
using DataAccess;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDAO _userDAO;
        public UserRepository(UserDAO userDAO)
        {
            _userDAO = userDAO;
        }
        public Task<List<User>> GetAllAsync() => _userDAO.GetAllAsync();
        public Task<User?> GetByIdAsync(int id) => _userDAO.GetByIdAsync(id);
        public Task AddAsync(User book) => _userDAO.AddAsync(book);
        public Task UpdateAsync(User book) => _userDAO.UpdateAsync(book);
        public Task DeleteAsync(User book) => _userDAO.DeleteAsync(book);
        public Task<User?> GetByEmailAsync(string email) => _userDAO.GetByEmailAsync(email);
        public Task UpdateWalletBalanceAsync(int userId, decimal amount) => _userDAO.UpdateWalletBalanceAsync(userId, amount);
        public Task<List<User>> GetUsersByRoleAsync(string roleName) => _userDAO.GetUsersByRoleAsync(roleName);
        public Task<User?> GetUserWithProfileAsync(int userId) => _userDAO.GetUserWithProfileAsync(userId);
    }
}
