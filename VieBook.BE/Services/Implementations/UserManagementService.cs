using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Services.Implementations
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IUserRepository _userRepository;

        public UserManagementService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<List<User>> GetUsersByRoleAsync(string roleName)
        {
            return await _userRepository.GetUsersByRoleAsync(roleName);
        }

        public async Task<List<User>> GetBookOwnersAsync()
        {
            Console.WriteLine("[DEBUG] UserManagementService.GetBookOwnersAsync: Starting...");
            var result = await _userRepository.GetUsersByRoleAsync("Owner");
            Console.WriteLine($"[DEBUG] UserManagementService.GetBookOwnersAsync: Found {result.Count} users");
            return result;
        }

        public async Task<List<User>> GetCustomersAsync()
        {
            return await _userRepository.GetUsersByRoleAsync("Customer");
        }

        public async Task<bool> LockUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.Status = "Locked";
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> UnlockUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.Status = "Active";
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> ToggleUserStatusAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            user.Status = user.Status == "Active" ? "Locked" : "Active";
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<User?> GetUserWithProfileAsync(int userId)
        {
            return await _userRepository.GetUserWithProfileAsync(userId);
        }
    }
}
