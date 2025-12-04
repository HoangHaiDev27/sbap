using BusinessObject.Dtos;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly TransactionDAO _transactionDAO;

        public TransactionRepository(TransactionDAO transactionDAO)
        {
            _transactionDAO = transactionDAO;
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
            return await _transactionDAO.GetTransactionsAsync(
                searchTerm, typeFilter, statusFilter, dateFilter, userId, page, pageSize);
        }

        public async Task<TransactionStatsResult> GetTransactionStatsAsync(
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null)
        {
            return await _transactionDAO.GetTransactionStatsAsync(
                typeFilter, statusFilter, dateFilter, userId);
        }

        public async Task<TransactionDetailResult?> GetTransactionDetailAsync(string transactionId)
        {
            return await _transactionDAO.GetTransactionDetailAsync(transactionId);
        }

        public async Task<bool> UpdateTransactionStatusAsync(string transactionId, string status, string? notes = null)
        {
            return await _transactionDAO.UpdateTransactionStatusAsync(transactionId, status, notes);
        }
    }
}
