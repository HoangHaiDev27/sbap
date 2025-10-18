using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class WalletTransactionRepository : IWalletTransactionRepository
    {
        private readonly WalletTransactionDAO _dao;

        public WalletTransactionRepository(WalletTransactionDAO dao)
        {
            _dao = dao;
        }

        public async Task<WalletTransaction?> GetByTransactionIdAsync(string transactionId)
        {
            return await _dao.GetByTransactionIdAsync(transactionId);
        }

        public async Task<WalletTransaction> CreateAsync(WalletTransaction walletTransaction)
        {
            return await _dao.CreateAsync(walletTransaction);
        }

        public async Task<WalletTransaction> UpdateAsync(WalletTransaction walletTransaction)
        {
            return await _dao.UpdateAsync(walletTransaction);
        }

        public async Task<bool> ExistsAsync(string transactionId)
        {
            return await _dao.ExistsAsync(transactionId);
        }

        public async Task<List<WalletTransaction>> GetByUserIdAsync(int userId)
        {
            return await _dao.GetByUserIdAsync(userId);
        }
    }
}
