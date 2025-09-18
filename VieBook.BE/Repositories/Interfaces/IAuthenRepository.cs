using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IAuthenRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);
    }
}