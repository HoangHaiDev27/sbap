using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class OrderItem
{
    public long OrderItemId { get; set; }

    public int CustomerId { get; set; }

    public int ChapterId { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal CashReceived { get; set; }

    public DateTime? PaidAt { get; set; }

    public string? OrderType { get; set; }

    public virtual Chapter Chapter { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;

    public virtual ICollection<PaymentRequest> PaymentRequests { get; set; } = new List<PaymentRequest>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
