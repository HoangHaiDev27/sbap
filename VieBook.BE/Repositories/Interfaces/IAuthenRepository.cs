using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IAuthenRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);
        Task<User> CreateAsync(User user);
        Task<Role?> GetRoleByIdAsync(int roleId);
        Task<ExternalLogin?> GetExternalLoginByProviderAndKeyAsync(string provider, string providerKey);
    }
}