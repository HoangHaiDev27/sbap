using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public byte[]? PasswordHash { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public decimal Wallet { get; set; }

    public virtual ICollection<BookApproval> BookApprovals { get; set; } = new List<BookApproval>();

    public virtual ICollection<BookClaim> BookClaimCustomers { get; set; } = new List<BookClaim>();

    public virtual ICollection<BookClaim> BookClaimProcessedByNavigations { get; set; } = new List<BookClaim>();

    public virtual ICollection<BookOffer> BookOffers { get; set; } = new List<BookOffer>();

    public virtual ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();

    public virtual ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();

    public virtual ICollection<ExternalLogin> ExternalLogins { get; set; } = new List<ExternalLogin>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual ICollection<PaymentRequest> PaymentRequests { get; set; } = new List<PaymentRequest>();

    public virtual ICollection<Post> PostAuthors { get; set; } = new List<Post>();

    public virtual ICollection<PostComment> PostCommentDeletedByNavigations { get; set; } = new List<PostComment>();

    public virtual ICollection<PostComment> PostCommentUsers { get; set; } = new List<PostComment>();

    public virtual ICollection<Post> PostDeletedByNavigations { get; set; } = new List<Post>();

    public virtual ICollection<PostReaction> PostReactions { get; set; } = new List<PostReaction>();

    public virtual ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();

    public virtual ICollection<ReadingSchedule> ReadingSchedules { get; set; } = new List<ReadingSchedule>();

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();

    public virtual ICollection<UserFeedback> UserFeedbackDeletedByNavigations { get; set; } = new List<UserFeedback>();

    public virtual ICollection<UserFeedback> UserFeedbackFromUsers { get; set; } = new List<UserFeedback>();

    public virtual ICollection<UserFollow> UserFollowFolloweds { get; set; } = new List<UserFollow>();

    public virtual ICollection<UserFollow> UserFollowFollowers { get; set; } = new List<UserFollow>();

    public virtual UserProfile? UserProfile { get; set; }

    public virtual ICollection<WalletTransaction> WalletTransactions { get; set; } = new List<WalletTransaction>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
    public virtual ICollection<ChapterAudio> ChapterAudios { get; set; } = new List<ChapterAudio>();

}
