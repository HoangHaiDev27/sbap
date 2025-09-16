using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Post
{
    public long PostId { get; set; }

    public int AuthorId { get; set; }

    public string? Content { get; set; }

    public string? PostType { get; set; }

    public string Visibility { get; set; } = null!;

    public int CommentCount { get; set; }

    public int ReactionCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public int? DeletedBy { get; set; }

    public virtual User Author { get; set; } = null!;

    public virtual BookOffer? BookOffer { get; set; }

    public virtual User? DeletedByNavigation { get; set; }

    public virtual ICollection<PostAttachment> PostAttachments { get; set; } = new List<PostAttachment>();

    public virtual ICollection<PostComment> PostComments { get; set; } = new List<PostComment>();

    public virtual ICollection<PostReaction> PostReactions { get; set; } = new List<PostReaction>();

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}
