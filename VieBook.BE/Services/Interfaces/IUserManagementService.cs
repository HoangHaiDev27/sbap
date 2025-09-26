using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IUserManagementService
    {
        // Lấy danh sách users theo role
        Task<List<User>> GetUsersByRoleAsync(string roleName);
        
        // Lấy danh sách tất cả book owners
        Task<List<User>> GetBookOwnersAsync();
        
        // Lấy danh sách tất cả customers
        Task<List<User>> GetCustomersAsync();
        
        // Lock/Unlock user
        Task<bool> LockUserAsync(int userId);
        Task<bool> UnlockUserAsync(int userId);
        Task<bool> ToggleUserStatusAsync(int userId);
        
        // Lấy thông tin user với profile
        Task<User?> GetUserWithProfileAsync(int userId);
    }
}
