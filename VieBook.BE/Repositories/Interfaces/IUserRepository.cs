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
        Task<bool> AddRoleToUserByNameAsync(int userId, string roleName);
        Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName);
    }
}
