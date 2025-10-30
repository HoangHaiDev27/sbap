using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace DataAccess.DAO
{
    public class TransactionDAO
    {
        private readonly VieBookContext _context;

        public TransactionDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<TransactionListResult> GetTransactionsAsync(
            string? searchTerm = null,
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null,
            int page = 1,
            int pageSize = 10)
        {
            var transactions = new List<TransactionResult>();

            // Lấy WalletTransactions (nạp tiền)
            if (typeFilter == "all" || typeFilter == "wallet_topup")
            {
                var walletQuery = _context.WalletTransactions
                    .Include(wt => wt.User)
                        .ThenInclude(u => u.UserProfile)
                    .AsQueryable();

                if (userId.HasValue)
                    walletQuery = walletQuery.Where(wt => wt.UserId == userId.Value);

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    walletQuery = walletQuery.Where(wt => 
                        wt.User.Email.Contains(searchTerm) ||
                        wt.TransactionId.Contains(searchTerm) ||
                        wt.User.UserProfile.FullName.Contains(searchTerm));
                }

                if (statusFilter != "all")
                {
                    walletQuery = walletQuery.Where(wt => wt.Status == statusFilter);
                }

                if (dateFilter != "all")
                {
                    var dateFilterValue = GetDateFilter(dateFilter);
                    if (dateFilterValue.HasValue)
                    {
                        walletQuery = walletQuery.Where(wt => wt.CreatedAt >= dateFilterValue.Value);
                    }
                }

                var walletTransactions = await walletQuery
                    .OrderByDescending(wt => wt.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                transactions.AddRange(walletTransactions.Select(wt => new TransactionResult
                {
                    Id = $"WT{wt.WalletTransactionId}",
                    UserId = wt.UserId,
                    UserName = wt.User.UserProfile?.FullName ?? wt.User.Email,
                    Type = "wallet_topup",
                    Description = "Nạp tiền vào ví",
                    AmountMoney = wt.AmountMoney,
                    AmountCoin = wt.AmountCoin,
                    Status = wt.Status,
                    Date = wt.CreatedAt.ToString("yyyy-MM-dd"),
                    Time = wt.CreatedAt.ToString("HH:mm:ss"),
                    Provider = wt.Provider,
                    TransactionId = wt.TransactionId,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    PlanName = null,
                    Period = null,
                    Currency = null
                }));
            }

            // Lấy OrderItems (mua chương)
            if (typeFilter == "all" || typeFilter == "chapter_purchase")
            {
                var orderQuery = _context.OrderItems
                    .Include(oi => oi.Customer)
                        .ThenInclude(c => c.UserProfile)
                    .Include(oi => oi.Chapter)
                        .ThenInclude(c => c.Book)
                    .Where(oi => oi.PaidAt.HasValue)
                    .AsQueryable();

                if (userId.HasValue)
                    orderQuery = orderQuery.Where(oi => oi.CustomerId == userId.Value);

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    orderQuery = orderQuery.Where(oi => 
                        oi.Customer.Email.Contains(searchTerm) ||
                        oi.Chapter.ChapterTitle.Contains(searchTerm) ||
                        oi.Chapter.Book.Title.Contains(searchTerm) ||
                        oi.Customer.UserProfile.FullName.Contains(searchTerm));
                }

                if (statusFilter != "all")
                {
                    // OrderItems luôn có trạng thái "Paid" khi được tạo
                    // Không cần filter thêm vì đã filter PaidAt.HasValue ở trên
                }

                if (dateFilter != "all")
                {
                    var dateFilterValue = GetDateFilter(dateFilter);
                    if (dateFilterValue.HasValue)
                    {
                        orderQuery = orderQuery.Where(oi => oi.PaidAt >= dateFilterValue.Value);
                    }
                }

                var orderItems = await orderQuery
                    .OrderByDescending(oi => oi.PaidAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                transactions.AddRange(orderItems.Select(oi => new TransactionResult
                {
                    Id = $"OI{oi.OrderItemId}",
                    UserId = oi.CustomerId,
                    UserName = oi.Customer.UserProfile?.FullName ?? oi.Customer.Email,
                    Type = "chapter_purchase",
                    Description = $"Mua chương {oi.Chapter.ChapterId} - {oi.Chapter.Book.Title}",
                    AmountMoney = null,
                    AmountCoin = oi.CashSpent,
                    Status = "Paid",
                    Date = oi.PaidAt?.ToString("yyyy-MM-dd") ?? "",
                    Time = oi.PaidAt?.ToString("HH:mm:ss") ?? "",
                    Provider = null,
                    TransactionId = null,
                    BookTitle = oi.Chapter.Book.Title,
                    ChapterTitle = $"Chương {oi.Chapter.ChapterId}: {oi.Chapter.ChapterTitle}",
                    OrderType = oi.OrderType,
                    PlanName = null,
                    Period = null,
                    Currency = null
                }));
            }

            // Lấy PaymentRequests (rút tiền)
            if (typeFilter == "all" || typeFilter == "withdrawal_request")
            {
                var paymentQuery = _context.PaymentRequests
                    .Include(pr => pr.User)
                        .ThenInclude(u => u.UserProfile)
                    .AsQueryable();

                if (userId.HasValue)
                    paymentQuery = paymentQuery.Where(pr => pr.UserId == userId.Value);

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    paymentQuery = paymentQuery.Where(pr => 
                        pr.User.Email.Contains(searchTerm) ||
                        pr.User.UserProfile.FullName.Contains(searchTerm));
                }

                if (statusFilter != "all")
                {
                    paymentQuery = paymentQuery.Where(pr => pr.Status == statusFilter);
                }

                if (dateFilter != "all")
                {
                    var dateFilterValue = GetDateFilter(dateFilter);
                    if (dateFilterValue.HasValue)
                    {
                        paymentQuery = paymentQuery.Where(pr => pr.RequestDate >= dateFilterValue.Value);
                    }
                }

                var paymentRequests = await paymentQuery
                    .OrderByDescending(pr => pr.RequestDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                transactions.AddRange(paymentRequests.Select(pr => new TransactionResult
                {
                    Id = $"PR{pr.PaymentRequestId}",
                    UserId = pr.UserId,
                    UserName = pr.User.UserProfile?.FullName ?? pr.User.Email,
                    Type = "withdrawal_request",
                    Description = "Yêu cầu rút tiền",
                    AmountMoney = null,
                    AmountCoin = pr.RequestedCoin,
                    Status = pr.Status,
                    Date = pr.RequestDate.ToString("yyyy-MM-dd"),
                    Time = pr.RequestDate.ToString("HH:mm:ss"),
                    Provider = null,
                    TransactionId = null,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    PlanName = null,
                    Period = null,
                    Currency = null
                }));
            }

            // Lấy Subscriptions (mua gói)
            if (typeFilter == "all" || typeFilter == "subscription_purchase")
            {
                var subscriptionQuery = _context.Subscriptions
                    .Include(s => s.User)
                        .ThenInclude(u => u.UserProfile)
                    .Include(s => s.Plan)
                    .AsQueryable();

                if (userId.HasValue)
                    subscriptionQuery = subscriptionQuery.Where(s => s.UserId == userId.Value);

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    subscriptionQuery = subscriptionQuery.Where(s => 
                        s.User.Email.Contains(searchTerm) ||
                        s.User.UserProfile.FullName.Contains(searchTerm) ||
                        s.Plan.Name.Contains(searchTerm));
                }

                if (statusFilter != "all")
                {
                    subscriptionQuery = subscriptionQuery.Where(s => s.Status == statusFilter);
                }

                if (dateFilter != "all")
                {
                    var dateFilterValue = GetDateFilter(dateFilter);
                    if (dateFilterValue.HasValue)
                    {
                        subscriptionQuery = subscriptionQuery.Where(s => s.CreatedAt >= dateFilterValue.Value);
                    }
                }

                var subscriptions = await subscriptionQuery
                    .OrderByDescending(s => s.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                transactions.AddRange(subscriptions.Select(s => new TransactionResult
                {
                    Id = $"SUB{s.SubscriptionId}",
                    UserId = s.UserId,
                    UserName = s.User.UserProfile?.FullName ?? s.User.Email,
                    Type = "subscription_purchase",
                    Description = $"Mua gói {s.Plan.Name}",
                    AmountMoney = null,
                    AmountCoin = s.Plan.Price,
                    Status = s.Status,
                    Date = s.CreatedAt.ToString("yyyy-MM-dd"),
                    Time = s.CreatedAt.ToString("HH:mm:ss"),
                    Provider = null,
                    TransactionId = null,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    PlanName = s.Plan.Name,
                    Period = s.Plan.Period,
                    Currency = s.Plan.Currency
                }));
            }

            // Sắp xếp theo thời gian
            transactions = transactions
                .OrderByDescending(t => DateTime.ParseExact($"{t.Date} {t.Time}", "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture))
                .ToList();

            // Tính tổng số lượng
            var totalCount = await GetTotalTransactionCountAsync(searchTerm, typeFilter, statusFilter, dateFilter, userId);

            return new TransactionListResult
            {
                Transactions = transactions,
                TotalCount = totalCount
            };
        }

        public async Task<TransactionStatsResult> GetTransactionStatsAsync(
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null)
        {
            var dateFilterValue = GetDateFilter(dateFilter);

            // Thống kê WalletTransactions
            var walletQuery = _context.WalletTransactions.AsQueryable();
            if (userId.HasValue) walletQuery = walletQuery.Where(wt => wt.UserId == userId.Value);
            if (dateFilterValue.HasValue) walletQuery = walletQuery.Where(wt => wt.CreatedAt >= dateFilterValue.Value);
            if (statusFilter != "all") walletQuery = walletQuery.Where(wt => wt.Status == statusFilter);

            var walletStats = await walletQuery.ToListAsync();

            // Thống kê OrderItems
            var orderQuery = _context.OrderItems
                .Where(oi => oi.PaidAt.HasValue)
                .AsQueryable();
            if (userId.HasValue) orderQuery = orderQuery.Where(oi => oi.CustomerId == userId.Value);
            if (dateFilterValue.HasValue) orderQuery = orderQuery.Where(oi => oi.PaidAt >= dateFilterValue.Value);

            var orderStats = await orderQuery.ToListAsync();

            // Thống kê PaymentRequests
            var paymentQuery = _context.PaymentRequests.AsQueryable();
            if (userId.HasValue) paymentQuery = paymentQuery.Where(pr => pr.UserId == userId.Value);
            if (dateFilterValue.HasValue) paymentQuery = paymentQuery.Where(pr => pr.RequestDate >= dateFilterValue.Value);
            if (statusFilter != "all") paymentQuery = paymentQuery.Where(pr => pr.Status == statusFilter);

            var paymentStats = await paymentQuery.ToListAsync();

            // Thống kê Subscriptions
            var subscriptionQuery = _context.Subscriptions.Include(s => s.Plan).AsQueryable();
            if (userId.HasValue) subscriptionQuery = subscriptionQuery.Where(s => s.UserId == userId.Value);
            if (dateFilterValue.HasValue) subscriptionQuery = subscriptionQuery.Where(s => s.CreatedAt >= dateFilterValue.Value);
            if (statusFilter != "all") subscriptionQuery = subscriptionQuery.Where(s => s.Status == statusFilter);

            var subscriptionStats = await subscriptionQuery.ToListAsync();

            var totalTransactions = walletStats.Count + orderStats.Count + paymentStats.Count + subscriptionStats.Count;
            var successfulTransactions = walletStats.Count(wt => wt.Status == "Succeeded") + 
                                        orderStats.Count + 
                                        paymentStats.Count(pr => pr.Status == "Succeeded") +
                                        subscriptionStats.Count(s => s.Status == "Active");
            var pendingTransactions = walletStats.Count(wt => wt.Status == "Pending") + 
                                    paymentStats.Count(pr => pr.Status == "Pending");
            var failedTransactions = walletStats.Count(wt => wt.Status == "Failed") + 
                                   paymentStats.Count(pr => pr.Status == "Rejected") +
                                   subscriptionStats.Count(s => s.Status == "Cancelled" || s.Status == "Expired");

            var totalRevenue = walletStats.Where(wt => wt.Status == "Succeeded").Sum(wt => wt.AmountMoney);
            var walletTopupAmount = walletStats.Where(wt => wt.Status == "Succeeded").Sum(wt => wt.AmountMoney);
            var chapterPurchaseAmount = orderStats.Sum(oi => oi.CashSpent);
            var withdrawalAmount = paymentStats.Where(pr => pr.Status == "Succeeded").Sum(pr => pr.RequestedCoin);
            var subscriptionAmount = subscriptionStats.Where(s => s.Status == "Active").Sum(s => s.Plan.Price);

            return new TransactionStatsResult
            {
                TotalTransactions = totalTransactions,
                SuccessfulTransactions = successfulTransactions,
                PendingTransactions = pendingTransactions,
                FailedTransactions = failedTransactions,
                TotalRevenue = totalRevenue,
                WalletTopupAmount = walletTopupAmount,
                ChapterPurchaseAmount = chapterPurchaseAmount,
                WithdrawalAmount = withdrawalAmount,
                SubscriptionAmount = subscriptionAmount
            };
        }

        public async Task<TransactionDetailResult?> GetTransactionDetailAsync(string transactionId)
        {
            if (transactionId.StartsWith("WT"))
            {
                var id = long.Parse(transactionId.Substring(2));
                var walletTransaction = await _context.WalletTransactions
                    .Include(wt => wt.User)
                        .ThenInclude(u => u.UserProfile)
                    .FirstOrDefaultAsync(wt => wt.WalletTransactionId == id);

                if (walletTransaction == null) return null;

                return new TransactionDetailResult
                {
                    Id = $"WT{walletTransaction.WalletTransactionId}",
                    UserId = walletTransaction.UserId,
                    UserName = walletTransaction.User.UserProfile?.FullName ?? walletTransaction.User.Email,
                    UserEmail = walletTransaction.User.Email,
                    Type = "wallet_topup",
                    Description = "Nạp tiền vào ví",
                    AmountMoney = walletTransaction.AmountMoney,
                    AmountCoin = walletTransaction.AmountCoin,
                    Status = walletTransaction.Status,
                    Date = walletTransaction.CreatedAt.ToString("yyyy-MM-dd"),
                    Time = walletTransaction.CreatedAt.ToString("HH:mm:ss"),
                    Provider = walletTransaction.Provider,
                    TransactionId = walletTransaction.TransactionId,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    Notes = null,
                    CreatedAt = walletTransaction.CreatedAt,
                    UpdatedAt = walletTransaction.CreatedAt,
                    PlanName = null,
                    Period = null,
                    Currency = null
                };
            }
            else if (transactionId.StartsWith("OI"))
            {
                var id = long.Parse(transactionId.Substring(2));
                var orderItem = await _context.OrderItems
                    .Include(oi => oi.Customer)
                        .ThenInclude(c => c.UserProfile)
                    .Include(oi => oi.Chapter)
                        .ThenInclude(c => c.Book)
                    .FirstOrDefaultAsync(oi => oi.OrderItemId == id);

                if (orderItem == null) return null;

                return new TransactionDetailResult
                {
                    Id = $"OI{orderItem.OrderItemId}",
                    UserId = orderItem.CustomerId,
                    UserName = orderItem.Customer.UserProfile?.FullName ?? orderItem.Customer.Email,
                    UserEmail = orderItem.Customer.Email,
                    Type = "chapter_purchase",
                    Description = $"Mua chương {orderItem.Chapter.ChapterId} - {orderItem.Chapter.Book.Title}",
                    AmountMoney = null,
                    AmountCoin = orderItem.CashSpent,
                    Status = "Paid",
                    Date = orderItem.PaidAt?.ToString("yyyy-MM-dd") ?? "",
                    Time = orderItem.PaidAt?.ToString("HH:mm:ss") ?? "",
                    Provider = null,
                    TransactionId = null,
                    BookTitle = orderItem.Chapter.Book.Title,
                    ChapterTitle = $"Chương {orderItem.Chapter.ChapterId}: {orderItem.Chapter.ChapterTitle}",
                    OrderType = orderItem.OrderType,
                    Notes = null,
                    CreatedAt = orderItem.PaidAt ?? DateTime.MinValue,
                    UpdatedAt = orderItem.PaidAt ?? DateTime.MinValue,
                    PlanName = null,
                    Period = null,
                    Currency = null
                };
            }
            else if (transactionId.StartsWith("PR"))
            {
                var id = long.Parse(transactionId.Substring(2));
                var paymentRequest = await _context.PaymentRequests
                    .Include(pr => pr.User)
                        .ThenInclude(u => u.UserProfile)
                    .FirstOrDefaultAsync(pr => pr.PaymentRequestId == id);

                if (paymentRequest == null) return null;

                return new TransactionDetailResult
                {
                    Id = $"PR{paymentRequest.PaymentRequestId}",
                    UserId = paymentRequest.UserId,
                    UserName = paymentRequest.User.UserProfile?.FullName ?? paymentRequest.User.Email,
                    UserEmail = paymentRequest.User.Email,
                    Type = "withdrawal_request",
                    Description = "Yêu cầu rút tiền",
                    AmountMoney = null,
                    AmountCoin = paymentRequest.RequestedCoin,
                    Status = paymentRequest.Status,
                    Date = paymentRequest.RequestDate.ToString("yyyy-MM-dd"),
                    Time = paymentRequest.RequestDate.ToString("HH:mm:ss"),
                    Provider = null,
                    TransactionId = null,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    Notes = null,
                    CreatedAt = paymentRequest.RequestDate,
                    UpdatedAt = paymentRequest.AcceptDate ?? paymentRequest.RequestDate,
                    PlanName = null,
                    Period = null,
                    Currency = null
                };
            }
            else if (transactionId.StartsWith("SUB"))
            {
                var id = long.Parse(transactionId.Substring(3));
                var subscription = await _context.Subscriptions
                    .Include(s => s.User)
                        .ThenInclude(u => u.UserProfile)
                    .Include(s => s.Plan)
                    .FirstOrDefaultAsync(s => s.SubscriptionId == id);

                if (subscription == null) return null;

                return new TransactionDetailResult
                {
                    Id = $"SUB{subscription.SubscriptionId}",
                    UserId = subscription.UserId,
                    UserName = subscription.User.UserProfile?.FullName ?? subscription.User.Email,
                    UserEmail = subscription.User.Email,
                    Type = "subscription_purchase",
                    Description = $"Mua gói {subscription.Plan.Name} - Chu kỳ: {subscription.Plan.Period}",
                    AmountMoney = null,
                    AmountCoin = subscription.Plan.Price,
                    Status = subscription.Status,
                    Date = subscription.CreatedAt.ToString("yyyy-MM-dd"),
                    Time = subscription.CreatedAt.ToString("HH:mm:ss"),
                    Provider = null,
                    TransactionId = null,
                    BookTitle = null,
                    ChapterTitle = null,
                    OrderType = null,
                    Notes = $"Bắt đầu: {subscription.StartAt:yyyy-MM-dd} | Kết thúc: {subscription.EndAt:yyyy-MM-dd}",
                    CreatedAt = subscription.CreatedAt,
                    UpdatedAt = subscription.CreatedAt,
                    PlanName = subscription.Plan.Name,
                    Period = subscription.Plan.Period,
                    Currency = subscription.Plan.Currency
                };
            }

            return null;
        }

        public async Task<bool> UpdateTransactionStatusAsync(string transactionId, string status, string? notes = null)
        {
            try
            {
                if (transactionId.StartsWith("WT"))
                {
                    var id = long.Parse(transactionId.Substring(2));
                    var walletTransaction = await _context.WalletTransactions.FindAsync(id);
                    if (walletTransaction != null)
                    {
                        walletTransaction.Status = status;
                        await _context.SaveChangesAsync();
                        return true;
                    }
                }
                else if (transactionId.StartsWith("PR"))
                {
                    var id = long.Parse(transactionId.Substring(2));
                    var paymentRequest = await _context.PaymentRequests.FindAsync(id);
                    if (paymentRequest != null)
                    {
                        paymentRequest.Status = status;
                        if (status == "Succeeded")
                        {
                            paymentRequest.AcceptDate = DateTime.UtcNow;
                        }
                        await _context.SaveChangesAsync();
                        return true;
                    }
                }
                // OrderItems không thể cập nhật trạng thái vì đã thanh toán
                return false;
            }
            catch
            {
                return false;
            }
        }

        private async Task<int> GetTotalTransactionCountAsync(
            string? searchTerm = null,
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null)
        {
            var dateFilterValue = GetDateFilter(dateFilter);
            var totalCount = 0;

            // Đếm WalletTransactions
            if (typeFilter == "all" || typeFilter == "wallet_topup")
            {
                var walletQuery = _context.WalletTransactions.AsQueryable();
                if (userId.HasValue) walletQuery = walletQuery.Where(wt => wt.UserId == userId.Value);
                if (dateFilterValue.HasValue) walletQuery = walletQuery.Where(wt => wt.CreatedAt >= dateFilterValue.Value);
                if (statusFilter != "all") walletQuery = walletQuery.Where(wt => wt.Status == statusFilter);
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    walletQuery = walletQuery.Include(wt => wt.User).ThenInclude(u => u.UserProfile)
                        .Where(wt => wt.User.Email.Contains(searchTerm) ||
                                    wt.TransactionId.Contains(searchTerm) ||
                                    wt.User.UserProfile.FullName.Contains(searchTerm));
                }
                totalCount += await walletQuery.CountAsync();
            }

            // Đếm OrderItems
            if (typeFilter == "all" || typeFilter == "chapter_purchase")
            {
                var orderQuery = _context.OrderItems.Where(oi => oi.PaidAt.HasValue).AsQueryable();
                if (userId.HasValue) orderQuery = orderQuery.Where(oi => oi.CustomerId == userId.Value);
                if (dateFilterValue.HasValue) orderQuery = orderQuery.Where(oi => oi.PaidAt >= dateFilterValue.Value);
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    orderQuery = orderQuery.Include(oi => oi.Customer).ThenInclude(c => c.UserProfile)
                        .Include(oi => oi.Chapter).ThenInclude(c => c.Book)
                        .Where(oi => oi.Customer.Email.Contains(searchTerm) ||
                                    oi.Chapter.ChapterTitle.Contains(searchTerm) ||
                                    oi.Chapter.Book.Title.Contains(searchTerm) ||
                                    oi.Customer.UserProfile.FullName.Contains(searchTerm));
                }
                totalCount += await orderQuery.CountAsync();
            }

            // Đếm PaymentRequests
            if (typeFilter == "all" || typeFilter == "withdrawal_request")
            {
                var paymentQuery = _context.PaymentRequests.AsQueryable();
                if (userId.HasValue) paymentQuery = paymentQuery.Where(pr => pr.UserId == userId.Value);
                if (dateFilterValue.HasValue) paymentQuery = paymentQuery.Where(pr => pr.RequestDate >= dateFilterValue.Value);
                if (statusFilter != "all") paymentQuery = paymentQuery.Where(pr => pr.Status == statusFilter);
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    paymentQuery = paymentQuery.Include(pr => pr.User).ThenInclude(u => u.UserProfile)
                        .Where(pr => pr.User.Email.Contains(searchTerm) ||
                                    pr.User.UserProfile.FullName.Contains(searchTerm));
                }
                totalCount += await paymentQuery.CountAsync();
            }

            // Đếm Subscriptions
            if (typeFilter == "all" || typeFilter == "subscription_purchase")
            {
                var subscriptionQuery = _context.Subscriptions.AsQueryable();
                if (userId.HasValue) subscriptionQuery = subscriptionQuery.Where(s => s.UserId == userId.Value);
                if (dateFilterValue.HasValue) subscriptionQuery = subscriptionQuery.Where(s => s.CreatedAt >= dateFilterValue.Value);
                if (statusFilter != "all") subscriptionQuery = subscriptionQuery.Where(s => s.Status == statusFilter);
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    subscriptionQuery = subscriptionQuery.Include(s => s.User).ThenInclude(u => u.UserProfile)
                        .Include(s => s.Plan)
                        .Where(s => s.User.Email.Contains(searchTerm) ||
                                    s.User.UserProfile.FullName.Contains(searchTerm) ||
                                    s.Plan.Name.Contains(searchTerm));
                }
                totalCount += await subscriptionQuery.CountAsync();
            }

            return totalCount;
        }

        private DateTime? GetDateFilter(string dateFilter)
        {
            var now = DateTime.UtcNow;
            return dateFilter switch
            {
                "today" => now.Date,
                "week" => now.AddDays(-7),
                "month" => now.AddDays(-30),
                _ => null
            };
        }
    }
}
