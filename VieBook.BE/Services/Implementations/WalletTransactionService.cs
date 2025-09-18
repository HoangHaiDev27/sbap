using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class WalletTransactionService : IWalletTransactionService
    {
        private readonly IWalletTransactionRepository _walletTransactionRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        public WalletTransactionService(IWalletTransactionRepository walletTransactionRepository, IUserRepository userRepository, INotificationService notificationService)
        {
            _walletTransactionRepository = walletTransactionRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
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

                // Nếu status là thành công và chưa cập nhật wallet, thì cập nhật wallet
                if (webhookData.Status == "Succeeded" && existingTransaction.Status != "Succeeded")
                {
                    await _userRepository.UpdateWalletBalanceAsync(existingTransaction.UserId, webhookData.AmountCoin);
                    // Tạo notification cho thanh toán thành công
                    await _notificationService.CreateWalletRechargeNotificationAsync(existingTransaction.UserId, webhookData.AmountCoin);
                }

                return await _walletTransactionRepository.UpdateAsync(existingTransaction);
            }

            // Tạo transaction mới
            var walletTransaction = new WalletTransaction
            {
                UserId = webhookData.UserId ?? 4, // Default user ID, có thể lấy từ session hoặc token
                Provider = "PayOS",
                TransactionId = webhookData.TransactionId ?? webhookData.OrderCode.ToString(),
                AmountMoney = webhookData.AmountMoney,
                AmountCoin = webhookData.AmountCoin,
                Status = webhookData.Status,
                CreatedAt = DateTime.UtcNow
            };

            // Nếu thanh toán thành công, cập nhật wallet balance
            if (webhookData.Status == "Succeeded")
            {
                await _userRepository.UpdateWalletBalanceAsync(walletTransaction.UserId, webhookData.AmountCoin);
                // Tạo notification cho thanh toán thành công
                await _notificationService.CreateWalletRechargeNotificationAsync(walletTransaction.UserId, webhookData.AmountCoin);
            }

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
