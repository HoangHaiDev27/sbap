using AutoMapper;
using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Globalization;

namespace Services.Implementations
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMapper _mapper;

        public TransactionService(ITransactionRepository transactionRepository, IMapper mapper)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
        }

        public async Task<TransactionListResponse> GetTransactionsAsync(
            string? searchTerm = null,
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null,
            int page = 1,
            int pageSize = 10)
        {
            var result = await _transactionRepository.GetTransactionsAsync(
                searchTerm, typeFilter, statusFilter, dateFilter, userId, page, pageSize);

            return new TransactionListResponse
            {
                Transactions = result.Transactions.Select(t => new TransactionDTO
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    UserName = t.UserName,
                    Type = t.Type,
                    Description = t.Description,
                    AmountMoney = t.AmountMoney,
                    AmountCoin = t.AmountCoin,
                    Status = t.Status,
                    Date = t.Date,
                    Time = t.Time,
                    Provider = t.Provider,
                    TransactionId = t.TransactionId,
                    BookTitle = t.BookTitle,
                    ChapterTitle = t.ChapterTitle,
                    OrderType = t.OrderType
                }).ToList(),
                TotalCount = result.TotalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            };
        }

        public async Task<TransactionStatsResponse> GetTransactionStatsAsync(
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null)
        {
            var stats = await _transactionRepository.GetTransactionStatsAsync(
                typeFilter, statusFilter, dateFilter, userId);

            return new TransactionStatsResponse
            {
                TotalTransactions = stats.TotalTransactions,
                SuccessfulTransactions = stats.SuccessfulTransactions,
                PendingTransactions = stats.PendingTransactions,
                FailedTransactions = stats.FailedTransactions,
                TotalRevenue = stats.TotalRevenue,
                WalletTopupAmount = stats.WalletTopupAmount,
                ChapterPurchaseAmount = stats.ChapterPurchaseAmount,
                WithdrawalAmount = stats.WithdrawalAmount
            };
        }

        public async Task<TransactionDetailResponse?> GetTransactionDetailAsync(string transactionId)
        {
            var transaction = await _transactionRepository.GetTransactionDetailAsync(transactionId);
            if (transaction == null) return null;

            return new TransactionDetailResponse
            {
                Id = transaction.Id,
                UserId = transaction.UserId,
                UserName = transaction.UserName,
                UserEmail = transaction.UserEmail,
                Type = transaction.Type,
                Description = transaction.Description,
                AmountMoney = transaction.AmountMoney,
                AmountCoin = transaction.AmountCoin,
                Status = transaction.Status,
                Date = transaction.Date,
                Time = transaction.Time,
                Provider = transaction.Provider,
                TransactionId = transaction.TransactionId,
                BookTitle = transaction.BookTitle,
                ChapterTitle = transaction.ChapterTitle,
                OrderType = transaction.OrderType,
                Notes = transaction.Notes,
                CreatedAt = transaction.CreatedAt,
                UpdatedAt = transaction.UpdatedAt
            };
        }

        public async Task<bool> UpdateTransactionStatusAsync(string transactionId, string status, string? notes = null)
        {
            return await _transactionRepository.UpdateTransactionStatusAsync(transactionId, status, notes);
        }
    }
}
