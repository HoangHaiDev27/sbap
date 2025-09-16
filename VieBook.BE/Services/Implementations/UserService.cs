using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        public UserService(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }
        public Task<List<User>> GetAllAsync() => _userRepo.GetAllAsync();
        public Task<User?> GetByIdAsync(int id) => _userRepo.GetByIdAsync(id);
        public Task AddAsync(User book) => _userRepo.AddAsync(book);
        public Task UpdateAsync(User book) => _userRepo.UpdateAsync(book);
        public Task DeleteAsync(User book) => _userRepo.DeleteAsync(book);
        public Task<User?> GetByEmailAsync(string email) => _userRepo.GetByEmailAsync(email);
    }
}
