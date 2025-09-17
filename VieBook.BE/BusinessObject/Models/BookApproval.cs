using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class BookApproval
{
    public int ApprovalId { get; set; }

    public int BookId { get; set; }

    public int StaffId { get; set; }

    public string Action { get; set; } = null!;

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User Staff { get; set; } = null!;
}
