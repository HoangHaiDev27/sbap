using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace DataAccess.DAO
{
    public class RefreshTokenDAO
    {
        private readonly VieBookContext _context;

        public RefreshTokenDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            return await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == token);
        }

        public async Task<RefreshToken?> GetActiveByUserIdAsync(int userId)
        {
            return await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.IsActive);
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveByUserIdRangeAsync(int userId, int count = 5)
        {
            return await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.IsActive)
                .OrderByDescending(rt => rt.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<RefreshToken> AddAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();
            return refreshToken;
        }

        public async Task UpdateAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Update(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }

        public async Task RevokeAllForUserAsync(int userId, string reason = "Logout")
        {
            var activeTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.IsActive)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
                token.ReasonRevoked = reason;
            }

            await _context.SaveChangesAsync();
        }

        public async Task CleanupExpiredTokensAsync()
        {
            var expiredTokens = await _context.RefreshTokens
                .Where(rt => rt.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

            _context.RefreshTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }

        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
