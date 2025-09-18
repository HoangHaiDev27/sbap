using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IPasswordResetTokenRepository
    {
        Task AddAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetByIdAsync(Guid tokenId);
        Task UpdateAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetLatestValidForUserAsync(int userId);
    }
}
