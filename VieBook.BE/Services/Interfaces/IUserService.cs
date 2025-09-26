using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IUserService
    {
        Task<List<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByIdWithProfileAndRolesAsync(int id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task<User?> GetByEmailAsync(string email);
        Task<bool> AddRoleToUserByNameAsync(int userId, string roleName);
        Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName);
        Task<List<Plan>> GetPlansByRoleAsync(string forRole);
        Task<Plan?> GetPlanByIdAsync(int planId);
        Task<Subscription> CreateSubscriptionAsync(int userId, Plan plan, DateTime startAt, DateTime endAt);
        Task<bool> DeductWalletAsync(int userId, decimal amount);
    }
}
