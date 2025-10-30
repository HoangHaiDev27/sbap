using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class OrderItem
{
    public long OrderItemId { get; set; }

    public int CustomerId { get; set; }

    public int ChapterId { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal CashSpent { get; set; }

    public DateTime? PaidAt { get; set; }

    public string? OrderType { get; set; }

    public int? PromotionId { get; set; } // ID của promotion nếu có (không tham chiếu foreign key)

    public virtual Chapter Chapter { get; set; } = null!;

    public virtual User Customer { get; set; } = null!;
}
