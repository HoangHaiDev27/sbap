using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class PasswordResetTokenDAO
    {
        private readonly VieBookContext _context;
        public PasswordResetTokenDAO(VieBookContext context) => _context = context;

        public async Task AddAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        public async Task<PasswordResetToken?> GetByIdAsync(Guid tokenId) =>
            await _context.PasswordResetTokens
                          .Include(t => t.User)
                          .FirstOrDefaultAsync(t => t.TokenId == tokenId);

        public async Task UpdateAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Update(token);
            await _context.SaveChangesAsync();
        }

        public async Task<PasswordResetToken?> GetLatestValidForUserAsync(int userId)
        {
            return await _context.PasswordResetTokens
                .Where(t => t.UserId == userId && t.ExpiresAt > DateTime.UtcNow && t.UsedAt == null)
                .OrderByDescending(t => t.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}
