using BusinessObject.Dtos;

namespace Repositories.Interfaces
{
    public interface ITransactionRepository
    {
        /// <summary>
        /// Lấy danh sách giao dịch với bộ lọc và phân trang
        /// </summary>
        Task<TransactionListResult> GetTransactionsAsync(
            string? searchTerm = null,
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null,
            int page = 1,
            int pageSize = 10);

        /// <summary>
        /// Lấy thống kê giao dịch
        /// </summary>
        Task<TransactionStatsResult> GetTransactionStatsAsync(
            string? typeFilter = "all",
            string? statusFilter = "all",
            string? dateFilter = "all",
            int? userId = null);

        /// <summary>
        /// Lấy chi tiết giao dịch theo ID
        /// </summary>
        Task<TransactionDetailResult?> GetTransactionDetailAsync(string transactionId);

        /// <summary>
        /// Cập nhật trạng thái giao dịch
        /// </summary>
        Task<bool> UpdateTransactionStatusAsync(string transactionId, string status, string? notes = null);
    }
}
