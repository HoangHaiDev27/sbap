using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IWalletTransactionRepository
    {
        Task<WalletTransaction?> GetByTransactionIdAsync(string transactionId);
        Task<WalletTransaction> CreateAsync(WalletTransaction walletTransaction);
        Task<WalletTransaction> UpdateAsync(WalletTransaction walletTransaction);
        Task<bool> ExistsAsync(string transactionId);
        Task<List<WalletTransaction>> GetByUserIdAsync(int userId);
    }
}
