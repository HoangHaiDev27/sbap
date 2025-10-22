using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Book
{
    public int BookId { get; set; }

    public int OwnerId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }
    public string? CoverUrl { get; set; }

    public string? Isbn { get; set; }

    public string? Language { get; set; }

    public string Status { get; set; } = null!;

    public int TotalView { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public string? Author { get; set; }
    public string? UploaderType { get; set; }  
    public string? UploadStatus { get; set; }     
    public string? CompletionStatus { get; set; }

    public virtual ICollection<BookApproval> BookApprovals { get; set; } = new List<BookApproval>();

    public virtual ICollection<BookOffer> BookOffers { get; set; } = new List<BookOffer>();

    public virtual ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();

    public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();

    public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<ReadingSchedule> ReadingSchedules { get; set; } = new List<ReadingSchedule>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
}
