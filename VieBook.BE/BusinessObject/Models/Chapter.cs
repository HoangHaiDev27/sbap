using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Chapter
{
    public int ChapterId { get; set; }

    public int BookId { get; set; }

    public string ChapterTitle { get; set; } = null!;

    public int ChapterView { get; set; }

    public string? ChapterSoftUrl { get; set; }

    public int? TotalPage { get; set; }

    public string? ChapterAudioUrl { get; set; }

    public int? DurationSec { get; set; }

    public decimal? PriceAudio { get; set; }

    public string? StorageMeta { get; set; }

    public DateTime UploadedAt { get; set; }
    public string? Status { get; set; }
    public string? VoiceName { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual ICollection<Bookmark> BookmarkChapterListens { get; set; } = new List<Bookmark>();

    public virtual ICollection<Bookmark> BookmarkChapterReads { get; set; } = new List<Bookmark>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
