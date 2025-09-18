using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly PasswordResetTokenDAO _dao;
        public PasswordResetTokenRepository(PasswordResetTokenDAO dao) => _dao = dao;

        public Task AddAsync(PasswordResetToken token) => _dao.AddAsync(token);
        public Task<PasswordResetToken?> GetByIdAsync(Guid tokenId) => _dao.GetByIdAsync(tokenId);
        public Task UpdateAsync(PasswordResetToken token) => _dao.UpdateAsync(token);
        public Task<PasswordResetToken?> GetLatestValidForUserAsync(int userId) => _dao.GetLatestValidForUserAsync(userId);
    }
}
