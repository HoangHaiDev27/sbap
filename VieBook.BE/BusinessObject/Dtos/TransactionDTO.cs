namespace BusinessObject.Dtos
{
    public class TransactionDTO
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? AmountMoney { get; set; }
        public decimal? AmountCoin { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public string? TransactionId { get; set; }
        public string? BookTitle { get; set; }
        public string? ChapterTitle { get; set; }
        public string? OrderType { get; set; }
    }

    public class TransactionListResponse
    {
        public List<TransactionDTO> Transactions { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class TransactionStatsResponse
    {
        public int TotalTransactions { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal WalletTopupAmount { get; set; }
        public decimal ChapterPurchaseAmount { get; set; }
        public decimal WithdrawalAmount { get; set; }
    }

    public class TransactionDetailResponse
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? AmountMoney { get; set; }
        public decimal? AmountCoin { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public string? TransactionId { get; set; }
        public string? BookTitle { get; set; }
        public string? ChapterTitle { get; set; }
        public string? OrderType { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Internal result classes for DAO layer
    public class TransactionResult
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? AmountMoney { get; set; }
        public decimal? AmountCoin { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public string? TransactionId { get; set; }
        public string? BookTitle { get; set; }
        public string? ChapterTitle { get; set; }
        public string? OrderType { get; set; }
    }

    public class TransactionListResult
    {
        public List<TransactionResult> Transactions { get; set; } = new();
        public int TotalCount { get; set; }
    }

    public class TransactionStatsResult
    {
        public int TotalTransactions { get; set; }
        public int SuccessfulTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal WalletTopupAmount { get; set; }
        public decimal ChapterPurchaseAmount { get; set; }
        public decimal WithdrawalAmount { get; set; }
    }

    public class TransactionDetailResult
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal? AmountMoney { get; set; }
        public decimal? AmountCoin { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public string? TransactionId { get; set; }
        public string? BookTitle { get; set; }
        public string? ChapterTitle { get; set; }
        public string? OrderType { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
