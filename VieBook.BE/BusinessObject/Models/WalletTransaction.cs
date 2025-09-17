using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class WalletTransaction
{
    public long WalletTransactionId { get; set; }

    public int UserId { get; set; }

    public string Provider { get; set; } = null!;

    public string TransactionId { get; set; } = null!;

    public decimal AmountMoney { get; set; }

    public decimal AmountCoin { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
