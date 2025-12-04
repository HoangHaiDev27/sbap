using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IWalletTransactionService
    {
        Task<WalletTransaction> ProcessPaymentAsync(PayOSWebhookDTO webhookData);
        Task<List<WalletTransaction>> GetUserTransactionsAsync(int userId);
        Task<WalletTransaction?> GetTransactionByIdAsync(long transactionId);
        Task<List<object>> GetUserTransactionHistoryAsync(int userId);
    }
}
