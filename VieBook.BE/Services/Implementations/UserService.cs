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
        public Task<User?> GetByIdWithProfileAndRolesAsync(int id) => _userRepo.GetByIdWithProfileAndRolesAsync(id);
        public Task AddAsync(User book) => _userRepo.AddAsync(book);
        public Task UpdateAsync(User book) => _userRepo.UpdateAsync(book);
        public Task DeleteAsync(User book) => _userRepo.DeleteAsync(book);
        public Task<User?> GetByEmailAsync(string email) => _userRepo.GetByEmailAsync(email);
        public Task<bool> AddRoleToUserByNameAsync(int userId, string roleName) => _userRepo.AddRoleToUserByNameAsync(userId, roleName);
        public Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName, string? portfolioUrl = null, string? bio = null, bool? agreeTos = null, string? address = null)
            => _userRepo.UpsertUserProfileAsync(userId, fullName, phoneNumber, dateOfBirth, avatarUrl, bankNumber, bankName, portfolioUrl, bio, agreeTos, address);
        public Task<List<Plan>> GetPlansByRoleAsync(string forRole) => _userRepo.GetPlansByRoleAsync(forRole);
        public Task<Plan?> GetPlanByIdAsync(int planId) => _userRepo.GetPlanByIdAsync(planId);
        public Task<Subscription> CreateSubscriptionAsync(int userId, Plan plan, DateTime startAt, DateTime endAt) => _userRepo.CreateSubscriptionAsync(userId, plan, startAt, endAt);
        public Task<bool> DeductWalletAsync(int userId, decimal amount) => _userRepo.DeductWalletAsync(userId, amount);
        public Task<Subscription?> GetUserActiveSubscriptionAsync(int userId) => _userRepo.GetUserActiveSubscriptionAsync(userId);
    }
}
