using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class BookReview
{
    public int ReviewId { get; set; }

    public int BookId { get; set; }

    public int UserId { get; set; }

    public byte Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
