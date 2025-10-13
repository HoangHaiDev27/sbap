using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using DataAccess.DAO;

namespace Services.Implementations
{
    public class WalletTransactionService : IWalletTransactionService
    {
        private readonly IWalletTransactionRepository _walletTransactionRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;
        private readonly OrderItemDAO _orderItemDAO;

        public WalletTransactionService(IWalletTransactionRepository walletTransactionRepository, IUserRepository userRepository, INotificationService notificationService, OrderItemDAO orderItemDAO)
        {
            _walletTransactionRepository = walletTransactionRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _orderItemDAO = orderItemDAO;
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
                UserId = webhookData.UserId ?? throw new ArgumentException("UserId is required for wallet transaction"),
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

        public async Task<List<object>> GetUserTransactionHistoryAsync(int userId)
        {
            var history = new List<object>();

            // Lấy WalletTransactions
            var walletTransactions = await _walletTransactionRepository.GetByUserIdAsync(userId);
            foreach (var wt in walletTransactions)
            {
                // Xác định loại giao dịch dựa trên AmountMoney và AmountCoin
                string transactionType = "deposit";
                decimal amount = 0;
                string description = "Giao dịch ví";
                
                // Ưu tiên AmountMoney trước
                if (wt.AmountMoney != 0)
                {
                    if (wt.AmountMoney > 0)
                    {
                        transactionType = "deposit";
                        amount = wt.AmountMoney;
                        description = "Nạp tiền vào ví";
                    }
                    else
                    {
                        transactionType = "withdraw";
                        amount = Math.Abs(wt.AmountMoney);
                        description = "Rút tiền từ ví";
                    }
                }
                // Nếu AmountMoney = 0, kiểm tra AmountCoin
                else if (wt.AmountCoin != 0)
                {
                    if (wt.AmountCoin > 0)
                    {
                        transactionType = "deposit";
                        amount = wt.AmountCoin;
                        description = "Nhận coin từ hệ thống";
                    }
                    else
                    {
                        transactionType = "withdraw";
                        amount = Math.Abs(wt.AmountCoin);
                        description = "Sử dụng coin";
                    }
                }

                history.Add(new
                {
                    Id = wt.TransactionId,
                    Type = "wallet",
                    TransactionType = transactionType,
                    Amount = amount,
                    Description = description,
                    Date = wt.CreatedAt,
                    Status = wt.Status
                });
            }

            // Lấy OrderItems từ DAO
            var orderItems = await _orderItemDAO.GetUserOrderItemsWithDetailsAsync(userId);

            foreach (var oi in orderItems)
            {
                history.Add(new
                {
                    Id = oi.OrderItemId,
                    Type = "purchase",
                    TransactionType = "purchase",
                    Amount = oi.CashSpent,
                    Description = $"Mua chương: {oi.Chapter.ChapterTitle}",
                    BookTitle = oi.Chapter.Book.Title,
                    BookAuthor = oi.Chapter.Book.Author,
                    ChapterTitle = oi.Chapter.ChapterTitle,
                    Date = oi.PaidAt ?? DateTime.UtcNow,
                    Status = "completed"
                });
            }

            // Sắp xếp theo ngày giảm dần
            return history.OrderByDescending(h => 
            {
                var dateProperty = h.GetType().GetProperty("Date");
                var dateValue = dateProperty?.GetValue(h);
                return dateValue != null ? (DateTime)dateValue : DateTime.MinValue;
            }).ToList();
        }
    }
}
