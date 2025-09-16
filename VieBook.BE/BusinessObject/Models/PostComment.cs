using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class PostComment
{
    public long CommentId { get; set; }

    public long PostId { get; set; }

    public long? ParentCommentId { get; set; }

    public int UserId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public int? DeletedBy { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<PostComment> InverseParentComment { get; set; } = new List<PostComment>();

    public virtual PostComment? ParentComment { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
