using System;
using System.Collections.Generic;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DataAccess;

public partial class VieBookContext : DbContext
{
    public VieBookContext()
    {
    }

    public VieBookContext(DbContextOptions<VieBookContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<BookApproval> BookApprovals { get; set; }

    public virtual DbSet<BookClaim> BookClaims { get; set; }

    public virtual DbSet<BookOffer> BookOffers { get; set; }

    public virtual DbSet<BookReview> BookReviews { get; set; }

    public virtual DbSet<Bookmark> Bookmarks { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Chapter> Chapters { get; set; }

    public virtual DbSet<ChatConversation> ChatConversations { get; set; }

    public virtual DbSet<ChatMessage> ChatMessages { get; set; }

    public virtual DbSet<ChatParticipant> ChatParticipants { get; set; }

    public virtual DbSet<ExternalLogin> ExternalLogins { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<PaymentRequest> PaymentRequests { get; set; }

    public virtual DbSet<Plan> Plans { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<PostAttachment> PostAttachments { get; set; }

    public virtual DbSet<PostComment> PostComments { get; set; }

    public virtual DbSet<PostReaction> PostReactions { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<ReadingSchedule> ReadingSchedules { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFeedback> UserFeedbacks { get; set; }

    public virtual DbSet<UserFollow> UserFollows { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<WalletTransaction> WalletTransactions { get; set; }

    public virtual DbSet<Wishlist> Wishlists { get; set; }

    public virtual DbSet<BookEmbedding> BookEmbeddings { get; set; }

    public virtual DbSet<ChapterContentEmbedding> ChapterContentEmbeddings { get; set; }

    public virtual DbSet<ChapterChunkEmbedding> ChapterChunkEmbeddings { get; set; }

    private string GetConnectionString()
    {
        IConfiguration configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", true, true).Build();
        return configuration["ConnectionStrings:DefaultConnection"];
    }
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlServer(GetConnectionString());
        }

    }

    //     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    // #warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //         => optionsBuilder.UseSqlServer("Server=localhost;Database=VieBook;User Id=SA;Password=YourStrong!Passw0rd;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.BookId).HasName("PK__Books__3DE0C2072C8A15DA");

            entity.HasIndex(e => e.OwnerId, "IX_Books_Owner");

            entity.HasIndex(e => e.Status, "IX_Books_Status");

            entity.HasIndex(e => e.Isbn, "UQ__Books__447D36EAF100CDCE").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Isbn)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("ISBN");
            entity.Property(e => e.Language)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(300);
            entity.Property(e => e.CoverUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);

            entity.HasOne(d => d.Owner).WithMany(p => p.Books)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Books__OwnerId__4222D4EF");

            entity.HasMany(d => d.Categories).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookCategory",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookCateg__Categ__47DBAE45"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookCateg__BookI__46E78A0C"),
                    j =>
                    {
                        j.HasKey("BookId", "CategoryId");
                        j.ToTable("BookCategories");
                    });
        });

        modelBuilder.Entity<BookApproval>(entity =>
        {
            entity.HasKey(e => e.ApprovalId).HasName("PK__BookAppr__328477F44CBF3B8F");

            entity.Property(e => e.Action)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Reason).HasMaxLength(1000);

            entity.HasOne(d => d.Book).WithMany(p => p.BookApprovals)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookAppro__BookI__4F7CD00D");

            entity.HasOne(d => d.Staff).WithMany(p => p.BookApprovals)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookAppro__Staff__5070F446");
        });

        modelBuilder.Entity<BookClaim>(entity =>
        {
            entity.HasKey(e => e.ClaimId).HasName("PK__BookClai__EF2E139B49BFBA30");

            entity.HasIndex(e => new { e.CustomerId, e.CreatedAt }, "IX_BookClaims_Customer").IsDescending(false, true);

            entity.HasIndex(e => new { e.BookOfferId, e.Status }, "IX_BookClaims_Offer");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.BookOffer).WithMany(p => p.BookClaims)
                .HasForeignKey(d => d.BookOfferId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookClaim__BookO__40F9A68C");

            entity.HasOne(d => d.Customer).WithMany(p => p.BookClaimCustomers)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookClaim__Custo__41EDCAC5");

            entity.HasOne(d => d.ProcessedByNavigation).WithMany(p => p.BookClaimProcessedByNavigations)
                .HasForeignKey(d => d.ProcessedBy)
                .HasConstraintName("FK__BookClaim__Proce__43D61337");
        });

        modelBuilder.Entity<BookOffer>(entity =>
        {
            entity.HasKey(e => e.BookOfferId).HasName("PK__BookOffe__7FC9564669C36573");

            entity.HasIndex(e => e.OwnerId, "IX_BookOffers_Owner");

            entity.HasIndex(e => e.PostId, "UQ__BookOffe__AA1260192A51DB3B").IsUnique();

            entity.Property(e => e.AccessType)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Criteria).HasMaxLength(1000);
            entity.Property(e => e.Quantity).HasDefaultValue(1);
            entity.Property(e => e.StartAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Book).WithMany(p => p.BookOffers)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookOffer__BookI__3C34F16F");

            entity.HasOne(d => d.Owner).WithMany(p => p.BookOffers)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookOffer__Owner__3B40CD36");

            entity.HasOne(d => d.Post).WithOne(p => p.BookOffer)
                .HasForeignKey<BookOffer>(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookOffer__PostI__3A4CA8FD");
        });

        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__BookRevi__74BC79CE2DB45E11");

            entity.HasIndex(e => e.BookId, "IX_BookReviews_Book");

            entity.HasIndex(e => new { e.BookId, e.UserId }, "UQ_BookReviews").IsUnique();

            entity.Property(e => e.Comment).HasMaxLength(2000);
            entity.Property(e => e.OwnerReply).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.BookReviews)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookRevie__BookI__797309D9");

            entity.HasOne(d => d.User).WithMany(p => p.BookReviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookRevie__UserI__7A672E12");
        });

        modelBuilder.Entity<Bookmark>(entity =>
        {
            entity.HasKey(e => e.BookmarkId).HasName("PK__Bookmark__541A3B715B666287");

            entity.HasIndex(e => new { e.UserId, e.BookId }, "IX_Bookmarks_UserBook");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookmarks__BookI__72C60C4A");

            entity.HasOne(d => d.ChapterListen).WithMany(p => p.BookmarkChapterListens)
                .HasForeignKey(d => d.ChapterListenId)
                .HasConstraintName("FK__Bookmarks__Chapt__74AE54BC");

            entity.HasOne(d => d.ChapterRead).WithMany(p => p.BookmarkChapterReads)
                .HasForeignKey(d => d.ChapterReadId)
                .HasConstraintName("FK__Bookmarks__Chapt__73BA3083");

            entity.HasOne(d => d.User).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookmarks__UserI__71D1E811");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A0B856ED40E");

            entity.HasIndex(e => new { e.Name, e.Type }, "UQ_Categories_NameType").IsUnique();

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__Categorie__Paren__3D5E1FD2");
        });

        modelBuilder.Entity<Chapter>(entity =>
        {
            entity.HasKey(e => e.ChapterId).HasName("PK__Chapters__0893A36A8742B26E");

            entity.HasIndex(e => e.BookId, "IX_Chapters_Book");

            entity.Property(e => e.ChapterAudioUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.ChapterSoftUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.ChapterTitle).HasMaxLength(500);
            entity.Property(e => e.PriceAudio).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StorageMeta).HasMaxLength(1000);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.Chapters)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Chapters__BookId__4AB81AF0");
        });

        modelBuilder.Entity<ChatConversation>(entity =>
        {
            entity.HasKey(e => e.ConversationId).HasName("PK__ChatConv__C050D87740B7279A");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__ChatMess__C87C0C9C6B67382D");

            entity.HasIndex(e => new { e.ConversationId, e.SentAt }, "IX_ChatMessages_ConvTime").IsDescending(false, true);

            entity.Property(e => e.AttachmentUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.SentAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Conversation).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatMessa__Conve__0A9D95DB");

            entity.HasOne(d => d.Sender).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatMessa__Sende__0B91BA14");
        });

        modelBuilder.Entity<ChatParticipant>(entity =>
        {
            entity.HasKey(e => new { e.ConversationId, e.UserId });

            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.RoleHint)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(d => d.Conversation).WithMany(p => p.ChatParticipants)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatParti__Conve__05D8E0BE");

            entity.HasOne(d => d.User).WithMany(p => p.ChatParticipants)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatParti__UserI__06CD04F7");
        });

        modelBuilder.Entity<ExternalLogin>(entity =>
        {
            entity.HasKey(e => e.ExternalLoginId).HasName("PK__External__A8FDB3AE7A5DD408");

            entity.HasIndex(e => new { e.Provider, e.ProviderKey }, "UQ_ExternalLogin").IsUnique();

            entity.Property(e => e.Provider)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ProviderKey)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.User).WithMany(p => p.ExternalLogins)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ExternalL__UserI__34C8D9D1");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E124D9B8989");

            entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt }, "IX_Notifications_User").IsDescending(false, false, true);

            entity.Property(e => e.Body).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__UserI__0F624AF8");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED0681D5C319A7");

            entity.HasIndex(e => e.ChapterId, "IX_OrderItems_Chapter");

            entity.HasIndex(e => new { e.CustomerId, e.PaidAt }, "IX_OrderItems_Customer");

            entity.Property(e => e.CashSpent).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Chapter).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Chapt__5CD6CB2B");

            entity.HasOne(d => d.Customer).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Custo__5BE2A6F2");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__Password__658FEEEA128C122B");

            entity.Property(e => e.TokenId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TokenHash).HasMaxLength(64);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PasswordR__UserI__38996AB5");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__RefreshT__658FEEEA128C122B");

            entity.Property(e => e.TokenId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TokenHash).HasMaxLength(255);
            entity.Property(e => e.ReplacedByToken).HasMaxLength(255);
            entity.Property(e => e.ReasonRevoked).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RefreshTo__UserI__39896AB5");
        });

        modelBuilder.Entity<PaymentRequest>(entity =>
        {
            entity.HasKey(e => e.PaymentRequestId).HasName("PK__PaymentR__973848EEB4AB3741");

            entity.HasIndex(e => new { e.Status, e.RequestDate }, "IX_PaymentRequests_Status_Date").IsDescending(false, true);

            entity.HasIndex(e => new { e.UserId, e.Status, e.RequestDate }, "IX_PaymentRequests_User_Status").IsDescending(false, false, true);

            entity.Property(e => e.RequestDate).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.RequestedCoin).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.User).WithMany(p => p.PaymentRequests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PaymentRe__UserI__66603565");
        });

        modelBuilder.Entity<Plan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Plans__755C22B7A64943D7");

            entity.HasIndex(e => new { e.ForRole, e.Status }, "IX_Plans_ForRoleStatus");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Currency)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("VND");
            entity.Property(e => e.ForRole)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Period)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.PostId).HasName("PK__Posts__AA126018FCA497A7");

            entity.HasIndex(e => new { e.AuthorId, e.CreatedAt }, "IX_Posts_AuthorTime").IsDescending(false, true);

            entity.HasIndex(e => new { e.Visibility, e.CreatedAt }, "IX_Posts_Visibility").IsDescending(false, true);

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.PostType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Visibility)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Author).WithMany(p => p.PostAuthors)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Posts__AuthorId__1EA48E88");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.PostDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__Posts__DeletedBy__22751F6C");

            entity.HasMany(d => d.Books).WithMany(p => p.Posts)
                .UsingEntity<Dictionary<string, object>>(
                    "PostBook",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__PostBooks__BookI__2B0A656D"),
                    l => l.HasOne<Post>().WithMany()
                        .HasForeignKey("PostId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__PostBooks__PostI__2A164134"),
                    j =>
                    {
                        j.HasKey("PostId", "BookId");
                        j.ToTable("PostBooks");
                    });
        });

        modelBuilder.Entity<PostAttachment>(entity =>
        {
            entity.HasKey(e => e.AttachmentId).HasName("PK__PostAtta__442C64BE1FE64856");

            entity.HasIndex(e => new { e.PostId, e.SortOrder }, "IX_PostAttachments_Post");

            entity.Property(e => e.FileType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.FileUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.Meta).HasMaxLength(1000);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Post).WithMany(p => p.PostAttachments)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostAttac__PostI__25518C17");
        });

        modelBuilder.Entity<PostComment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__PostComm__C3B4DFCA21D06A37");

            entity.HasIndex(e => e.ParentCommentId, "IX_PostComments_Parent");

            entity.HasIndex(e => new { e.PostId, e.CreatedAt }, "IX_PostComments_PostTime");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.PostCommentDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__PostComme__Delet__367C1819");

            entity.HasOne(d => d.ParentComment).WithMany(p => p.InverseParentComment)
                .HasForeignKey(d => d.ParentCommentId)
                .HasConstraintName("FK__PostComme__Paren__339FAB6E");

            entity.HasOne(d => d.Post).WithMany(p => p.PostComments)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostComme__PostI__32AB8735");

            entity.HasOne(d => d.User).WithMany(p => p.PostCommentUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostComme__UserI__3493CFA7");
        });

        modelBuilder.Entity<PostReaction>(entity =>
        {
            entity.HasKey(e => new { e.PostId, e.UserId });

            entity.HasIndex(e => e.ReactionType, "IX_PostReactions_Type");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.ReactionType)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(d => d.Post).WithMany(p => p.PostReactions)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostReact__PostI__2DE6D218");

            entity.HasOne(d => d.User).WithMany(p => p.PostReactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostReact__UserI__2EDAF651");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42FCF56F2FF21");

            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.DiscountType)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.DiscountValue).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PromotionName).HasMaxLength(200);

            entity.HasOne(d => d.Owner).WithMany(p => p.Promotions)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Owner__5441852A");

            entity.HasMany(d => d.Books).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionApplication",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__BookI__59063A47"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__Promo__5812160E"),
                    j =>
                    {
                        j.HasKey("PromotionId", "BookId");
                        j.ToTable("PromotionApplications");
                    });
        });

        modelBuilder.Entity<ReadingSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__ReadingS__9C8A5B495D72173E");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Book).WithMany(p => p.ReadingSchedules)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReadingSc__BookI__151B244E");

            entity.HasOne(d => d.User).WithMany(p => p.ReadingSchedules)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReadingSc__UserI__14270015");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A3E40C715");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B616004E7B066").IsUnique();

            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId).HasName("PK__Subscrip__9A2B249D9088D343");

            entity.HasIndex(e => new { e.PlanId, e.Status }, "IX_Subscriptions_PlanStatus");

            entity.HasIndex(e => new { e.UserId, e.Status }, "IX_Subscriptions_UserStatus");

            entity.Property(e => e.AutoRenew).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Plan).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.PlanId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Subscript__PlanI__4B7734FF");

            entity.HasOne(d => d.User).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Subscript__UserI__4A8310C6");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CDEBDE7F4");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534916CF6EB").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Wallet).HasColumnType("decimal(18, 2)");

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__RoleI__30F848ED"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__UserI__300424B4"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("UserRoles");
                    });
        });

        modelBuilder.Entity<UserFeedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__UserFeed__6A4BEDD67E11093D");

            entity.Property(e => e.Content).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TargetType)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.UserFeedbackDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__UserFeedb__Delet__00200768");

            entity.HasOne(d => d.FromUser).WithMany(p => p.UserFeedbackFromUsers)
                .HasForeignKey(d => d.FromUserId)
                .HasConstraintName("FK__UserFeedb__FromU__7E37BEF6");
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(e => new { e.FollowerId, e.FollowedId });

            entity.HasIndex(e => e.FollowedId, "IX_UserFollows_Followed");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Followed).WithMany(p => p.UserFollowFolloweds)
                .HasForeignKey(d => d.FollowedId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__1AD3FDA4");

            entity.HasOne(d => d.Follower).WithMany(p => p.UserFollowFollowers)
                .HasForeignKey(d => d.FollowerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__19DFD96B");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__UserProf__1788CC4C9289A796");

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.BankName).HasMaxLength(150);
            entity.Property(e => e.BankNumber)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(150);
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(30)
                .IsUnicode(false);
            entity.Property(e => e.Wallet).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .HasForeignKey<UserProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserProfi__UserI__2C3393D0");
        });

        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.HasKey(e => e.WalletTransactionId).HasName("PK__WalletTr__7184AEEF5C7F39AA");

            entity.HasIndex(e => new { e.UserId, e.Status, e.CreatedAt }, "IX_WalletTransactions_User_Status").IsDescending(false, false, true);

            entity.HasIndex(e => new { e.Provider, e.TransactionId }, "UQ_WalletTransactions").IsUnique();

            entity.Property(e => e.AmountCoin).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.AmountMoney).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Provider)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TransactionId)
                .HasMaxLength(200)
                .IsUnicode(false);

            entity.HasOne(d => d.User).WithMany(p => p.WalletTransactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__WalletTra__UserI__619B8048");
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => e.WishlistId).HasName("PK__Wishlist__233189EB1572DE5F");

            entity.HasIndex(e => new { e.UserId, e.BookId }, "UQ_Wishlists_UserBook").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Wishlists__BookI__6E01572D");

            entity.HasOne(d => d.User).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Wishlists__UserI__6D0D32F4");
        });
        modelBuilder.Entity<BookEmbedding>(entity =>
        {
            entity.ToTable("BookEmbeddings");
            entity.HasKey(e => e.BookId).HasName("PK__BookEmbed__3214EC276F685795");

            // Map property names to DB columns
            entity.Property(e => e.VectorBook).HasColumnName("Vector_Book");
            entity.Property(e => e.Categories).HasColumnName("Categories");
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

            // FK to Books
            entity.HasOne(e => e.Book)
                .WithOne()
                .HasForeignKey<BookEmbedding>(e => e.BookId)
                .HasConstraintName("FK_BookEmbeddings_Books");
        });

        modelBuilder.Entity<ChapterContentEmbedding>(entity =>
        {
            entity.ToTable("ChapterContentEmbeddings");
            entity.HasKey(e => e.ChapterId).HasName("PK__ChapterContentEmbeddings__3214EC276F685795");

            // Map property names to DB columns
            entity.Property(e => e.VectorChapterContent).HasColumnName("Vector_ChapterContent");
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

            // FKs
            entity.HasOne(e => e.Chapter)
                .WithMany()
                .HasForeignKey(e => e.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChapterContentEmbeddings_Chapters");

            entity.HasOne(e => e.Book)
                .WithMany()
                .HasForeignKey(e => e.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChapterContentEmbeddings_Books");
        });

        modelBuilder.Entity<ChapterChunkEmbedding>(entity =>
        {
            entity.ToTable("ChapterChunkEmbeddings");
            entity.HasKey(e => e.ChunkId).HasName("PK__ChapterChunkEmbeddings__3214EC276F685795");

            // Map property names to DB columns
            entity.Property(e => e.VectorChunkContent).HasColumnName("Vector_ChunkContent");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            // Unique constraint on (ChapterId, ChunkIndex)
            entity.HasIndex(e => new { e.ChapterId, e.ChunkIndex })
                .IsUnique()
                .HasDatabaseName("UQ_ChapterChunkEmbeddings");

            // FKs
            entity.HasOne(e => e.Chapter)
                .WithMany()
                .HasForeignKey(e => e.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChapterChunkEmbeddings_Chapters");

            entity.HasOne(e => e.Book)
                .WithMany()
                .HasForeignKey(e => e.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChapterChunkEmbeddings_Books");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
