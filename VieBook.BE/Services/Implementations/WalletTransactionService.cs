using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class WalletTransactionService : IWalletTransactionService
    {
        private readonly IWalletTransactionRepository _walletTransactionRepository;

        public WalletTransactionService(IWalletTransactionRepository walletTransactionRepository)
        {
            _walletTransactionRepository = walletTransactionRepository;
        }

        public async Task<WalletTransaction> ProcessPaymentAsync(PayOSWebhookDTO webhookData)
        {
            // Kiểm tra xem transaction đã tồn tại chưa
            var existingTransaction = await _walletTransactionRepository.GetByTransactionIdAsync(webhookData.TransactionId ?? "");
            
            if (existingTransaction != null)
            {
                // Cập nhật transaction hiện tại
                existingTransaction.Status = webhookData.Status;
                existingTransaction.AmountMoney = webhookData.AmountMoney;
                existingTransaction.AmountCoin = webhookData.AmountCoin;
                return await _walletTransactionRepository.UpdateAsync(existingTransaction);
            }

            // Tạo transaction mới
            var walletTransaction = new WalletTransaction
            {
                UserId = webhookData.UserId ?? 1, // Default user ID, có thể lấy từ session hoặc token
                Provider = "PayOS",
                TransactionId = webhookData.TransactionId ?? webhookData.OrderCode.ToString(),
                AmountMoney = webhookData.AmountMoney,
                AmountCoin = webhookData.AmountCoin,
                Status = webhookData.Status,
                CreatedAt = DateTime.UtcNow
            };

            return await _walletTransactionRepository.CreateAsync(walletTransaction);
        }

        public async Task<List<WalletTransaction>> GetUserTransactionsAsync(int userId)
        {
            return await _walletTransactionRepository.GetByUserIdAsync(userId);
        }

        public async Task<WalletTransaction?> GetTransactionByIdAsync(long transactionId)
        {
            return await _walletTransactionRepository.GetByTransactionIdAsync(transactionId.ToString());
        }
    }
}
