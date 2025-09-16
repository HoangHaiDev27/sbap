using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Promotion
{
    public int PromotionId { get; set; }

    public int OwnerId { get; set; }

    public string PromotionName { get; set; } = null!;

    public string? Description { get; set; }

    public string DiscountType { get; set; } = null!;

    public decimal DiscountValue { get; set; }

    public int Quantity { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime EndAt { get; set; }

    public bool IsActive { get; set; }

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}
