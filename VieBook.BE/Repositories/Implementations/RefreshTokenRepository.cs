using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly RefreshTokenDAO _refreshTokenDAO;

        public RefreshTokenRepository(RefreshTokenDAO refreshTokenDAO)
        {
            _refreshTokenDAO = refreshTokenDAO;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _refreshTokenDAO.GetByTokenAsync(token);
        }

        public async Task<RefreshToken?> GetActiveByUserIdAsync(int userId)
        {
            return await _refreshTokenDAO.GetActiveByUserIdAsync(userId);
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdRangeAsync(int userId, int count = 5)
        {
            return await _refreshTokenDAO.GetActiveByUserIdRangeAsync(userId, count);
        }

        public async Task<RefreshToken> AddAsync(RefreshToken refreshToken)
        {
            return await _refreshTokenDAO.AddAsync(refreshToken);
        }

        public async Task UpdateAsync(RefreshToken refreshToken)
        {
            await _refreshTokenDAO.UpdateAsync(refreshToken);
        }

        public async Task DeleteAsync(RefreshToken refreshToken)
        {
            await _refreshTokenDAO.DeleteAsync(refreshToken);
        }

        public async Task RevokeAllForUserAsync(int userId, string reason = "Logout")
        {
            await _refreshTokenDAO.RevokeAllForUserAsync(userId, reason);
        }

        public async Task CleanupExpiredTokensAsync()
        {
            await _refreshTokenDAO.CleanupExpiredTokensAsync();
        }
    }
}
