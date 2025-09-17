using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class BookOffer
{
    public long BookOfferId { get; set; }

    public long PostId { get; set; }

    public int OwnerId { get; set; }

    public int BookId { get; set; }

    public string AccessType { get; set; } = null!;

    public int Quantity { get; set; }

    public string? Criteria { get; set; }

    public DateTime StartAt { get; set; }

    public DateTime? EndAt { get; set; }

    public string Status { get; set; } = null!;

    public virtual Book Book { get; set; } = null!;

    public virtual ICollection<BookClaim> BookClaims { get; set; } = new List<BookClaim>();

    public virtual User Owner { get; set; } = null!;

    public virtual Post Post { get; set; } = null!;
}
