using BusinessObject;
using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByIdWithProfileAndRolesAsync(int id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task UpdateWalletBalanceAsync(int userId, decimal amount);
        Task<List<User>> GetUsersByRoleAsync(string roleName);
        Task<User?> GetUserWithProfileAsync(int userId);
        Task<bool> AddRoleToUserByNameAsync(int userId, string roleName);
        Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName);
        // Plans & Subscriptions (owner packages)
        Task<List<Plan>> GetPlansByRoleAsync(string forRole);
        Task<Plan?> GetPlanByIdAsync(int planId);
        Task<Subscription> CreateSubscriptionAsync(int userId, Plan plan, DateTime startAt, DateTime endAt);
        Task<bool> DeductWalletAsync(int userId, decimal amount);
        Task<Subscription?> GetUserActiveSubscriptionAsync(int userId);
    }
}
