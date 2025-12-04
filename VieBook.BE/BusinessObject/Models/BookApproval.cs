using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class BookApproval
{
    public int ApprovalId { get; set; }

    public int BookId { get; set; }

    public int? StaffId { get; set; }  // Nullable - null khi chưa có staff phê duyệt

    public string Action { get; set; } = null!;

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User? Staff { get; set; }  // Nullable navigation property
}
