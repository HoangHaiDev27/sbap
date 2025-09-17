using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class PaymentRequest
{
    public long PaymentRequestId { get; set; }

    public int UserId { get; set; }

    public decimal RequestedCoin { get; set; }

    public string Status { get; set; } = null!;

    public DateTime RequestDate { get; set; }

    public DateTime? AcceptDate { get; set; }

    public virtual User User { get; set; } = null!;
}
