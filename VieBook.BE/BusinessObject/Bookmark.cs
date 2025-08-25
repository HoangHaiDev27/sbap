using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class Bookmark
{
    public int BookmarkId { get; set; }

    public int UserId { get; set; }

    public int BookId { get; set; }

    public int? ChapterReadId { get; set; }

    public int? ChapterListenId { get; set; }

    public int? PagePosition { get; set; }

    public int? AudioPosition { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual Chapter? ChapterListen { get; set; }

    public virtual Chapter? ChapterRead { get; set; }

    public virtual User User { get; set; } = null!;
}
