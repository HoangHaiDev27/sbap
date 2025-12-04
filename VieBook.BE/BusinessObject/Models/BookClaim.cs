using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class BookClaim
{
    public long ClaimId { get; set; }

    public long BookOfferId { get; set; }

    public int CustomerId { get; set; }

    public int? ChapterId { get; set; }

    public int? AudioId { get; set; }

    public string? Note { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? ProcessedAt { get; set; }

    public int? ProcessedBy { get; set; }

    public virtual BookOffer BookOffer { get; set; } = null!;

    public virtual Chapter? Chapter { get; set; }

    public virtual ChapterAudio? ChapterAudio { get; set; }

    public virtual User Customer { get; set; } = null!;

    public virtual User? ProcessedByNavigation { get; set; }
}
