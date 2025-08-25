using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class PostReaction
{
    public long PostId { get; set; }

    public int UserId { get; set; }

    public string ReactionType { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Post Post { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
