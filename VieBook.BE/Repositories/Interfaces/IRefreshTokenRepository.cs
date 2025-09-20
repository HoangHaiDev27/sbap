using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetActiveByUserIdAsync(int userId);
        Task<IEnumerable<RefreshToken>> GetActiveByUserIdRangeAsync(int userId, int count = 5);
        Task<RefreshToken> AddAsync(RefreshToken refreshToken);
        Task UpdateAsync(RefreshToken refreshToken);
        Task DeleteAsync(RefreshToken refreshToken);
        Task RevokeAllForUserAsync(int userId, string reason = "Logout");
        Task CleanupExpiredTokensAsync();
    }
}
