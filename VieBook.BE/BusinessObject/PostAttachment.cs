using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class PostAttachment
{
    public long AttachmentId { get; set; }

    public long PostId { get; set; }

    public string FileType { get; set; } = null!;

    public string FileUrl { get; set; } = null!;

    public string? Meta { get; set; }

    public int SortOrder { get; set; }

    public DateTime UploadedAt { get; set; }

    public virtual Post Post { get; set; } = null!;
}
