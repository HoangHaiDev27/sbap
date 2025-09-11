using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BusinessObject;

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

    public virtual DbSet<Payment> Payments { get; set; }

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

    public virtual DbSet<Wishlist> Wishlists { get; set; }
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

    //    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    //#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
    //        => optionsBuilder.UseSqlServer("Data Source = LAPTOP-N5QMVHEE; Database=VieBook;User Id = sa; Password=26052018;TrustServerCertificate=true;Trusted_Connection=SSPI;Encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.BookId).HasName("PK__Books__3DE0C207BE322307");

            entity.HasIndex(e => e.OwnerId, "IX_Books_Owner");

            entity.HasIndex(e => e.Status, "IX_Books_Status");

            entity.HasIndex(e => e.Isbn, "UQ__Books__447D36EA59BF933B").IsUnique();

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

            entity.HasOne(d => d.Owner).WithMany(p => p.Books)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Books__OwnerId__5441852A");

            entity.HasMany(d => d.Categories).WithMany(p => p.Books)
                .UsingEntity<Dictionary<string, object>>(
                    "BookCategory",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookCateg__Categ__59FA5E80"),
                    l => l.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__BookCateg__BookI__59063A47"),
                    j =>
                    {
                        j.HasKey("BookId", "CategoryId");
                        j.ToTable("BookCategories");
                    });
        });

        modelBuilder.Entity<BookApproval>(entity =>
        {
            entity.HasKey(e => e.ApprovalId).HasName("PK__BookAppr__328477F48A5D390B");

            entity.Property(e => e.Action)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Reason).HasMaxLength(1000);

            entity.HasOne(d => d.Book).WithMany(p => p.BookApprovals)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookAppro__BookI__619B8048");

            entity.HasOne(d => d.Staff).WithMany(p => p.BookApprovals)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookAppro__Staff__628FA481");
        });

        modelBuilder.Entity<BookClaim>(entity =>
        {
            entity.HasKey(e => e.ClaimId).HasName("PK__BookClai__EF2E139BCD4868FC");

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
                .HasConstraintName("FK__BookClaim__BookO__4F47C5E3");

            entity.HasOne(d => d.Customer).WithMany(p => p.BookClaimCustomers)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookClaim__Custo__503BEA1C");

            entity.HasOne(d => d.ProcessedByNavigation).WithMany(p => p.BookClaimProcessedByNavigations)
                .HasForeignKey(d => d.ProcessedBy)
                .HasConstraintName("FK__BookClaim__Proce__5224328E");
        });

        modelBuilder.Entity<BookOffer>(entity =>
        {
            entity.HasKey(e => e.BookOfferId).HasName("PK__BookOffe__7FC9564693F5516C");

            entity.HasIndex(e => e.OwnerId, "IX_BookOffers_Owner");

            entity.HasIndex(e => e.PostId, "UQ__BookOffe__AA126019638A198A").IsUnique();

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
                .HasConstraintName("FK__BookOffer__BookI__4A8310C6");

            entity.HasOne(d => d.Owner).WithMany(p => p.BookOffers)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookOffer__Owner__498EEC8D");

            entity.HasOne(d => d.Post).WithOne(p => p.BookOffer)
                .HasForeignKey<BookOffer>(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookOffer__PostI__489AC854");
        });

        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__BookRevi__74BC79CEC7E1E36E");

            entity.HasIndex(e => e.BookId, "IX_BookReviews_Book");

            entity.HasIndex(e => new { e.BookId, e.UserId }, "UQ_BookReviews").IsUnique();

            entity.Property(e => e.Comment).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.BookReviews)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookRevie__BookI__07C12930");

            entity.HasOne(d => d.User).WithMany(p => p.BookReviews)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BookRevie__UserI__08B54D69");
        });

        modelBuilder.Entity<Bookmark>(entity =>
        {
            entity.HasKey(e => e.BookmarkId).HasName("PK__Bookmark__541A3B71EA069E31");

            entity.HasIndex(e => new { e.UserId, e.BookId }, "IX_Bookmarks_UserBook");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookmarks__BookI__01142BA1");

            entity.HasOne(d => d.ChapterListen).WithMany(p => p.BookmarkChapterListens)
                .HasForeignKey(d => d.ChapterListenId)
                .HasConstraintName("FK__Bookmarks__Chapt__02FC7413");

            entity.HasOne(d => d.ChapterRead).WithMany(p => p.BookmarkChapterReads)
                .HasForeignKey(d => d.ChapterReadId)
                .HasConstraintName("FK__Bookmarks__Chapt__02084FDA");

            entity.HasOne(d => d.User).WithMany(p => p.Bookmarks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Bookmarks__UserI__00200768");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A0BF8F29DD7");

            entity.HasIndex(e => new { e.Name, e.Type }, "UQ_Categories_NameType").IsUnique();

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__Categorie__Paren__4F7CD00D");
        });

        modelBuilder.Entity<Chapter>(entity =>
        {
            entity.HasKey(e => e.ChapterId).HasName("PK__Chapters__0893A36AA68599DA");

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
                .HasConstraintName("FK__Chapters__BookId__5CD6CB2B");
        });

        modelBuilder.Entity<ChatConversation>(entity =>
        {
            entity.HasKey(e => e.ConversationId).HasName("PK__ChatConv__C050D877974DC9F1");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__ChatMess__C87C0C9C58EF05E3");

            entity.HasIndex(e => new { e.ConversationId, e.SentAt }, "IX_ChatMessages_ConvTime").IsDescending(false, true);

            entity.Property(e => e.AttachmentUrl)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.SentAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Conversation).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.ConversationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatMessa__Conve__18EBB532");

            entity.HasOne(d => d.Sender).WithMany(p => p.ChatMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatMessa__Sende__19DFD96B");
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
                .HasConstraintName("FK__ChatParti__Conve__14270015");

            entity.HasOne(d => d.User).WithMany(p => p.ChatParticipants)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ChatParti__UserI__151B244E");
        });

        modelBuilder.Entity<ExternalLogin>(entity =>
        {
            entity.HasKey(e => e.ExternalLoginId).HasName("PK__External__A8FDB3AE2340700F");

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
                .HasConstraintName("FK__ExternalL__UserI__46E78A0C");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E1204F694C9");

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
                .HasConstraintName("FK__Notificat__UserI__1DB06A4F");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED0681718D40C1");

            entity.HasIndex(e => e.ChapterId, "IX_OrderItems_Chapter");

            entity.HasIndex(e => new { e.CustomerId, e.PaidAt }, "IX_OrderItems_Customer");

            entity.Property(e => e.CashReceived).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Chapter).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Chapt__6EF57B66");

            entity.HasOne(d => d.Customer).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Custo__6E01572D");
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PK__Password__658FEEEAEC65421B");

            entity.Property(e => e.TokenId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TokenHash).HasMaxLength(64);

            entity.HasOne(d => d.User).WithMany(p => p.PasswordResetTokens)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PasswordR__UserI__4AB81AF0");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A386894593F");

            entity.HasIndex(e => new { e.Provider, e.TransactionId }, "UQ_Payments").IsUnique();

            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Provider)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TransactionId)
                .HasMaxLength(200)
                .IsUnicode(false);

            entity.HasOne(d => d.OrderItem).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Payments__OrderI__72C60C4A");
        });

        modelBuilder.Entity<PaymentRequest>(entity =>
        {
            entity.HasKey(e => e.PaymentRequestId).HasName("PK__PaymentR__9738488E3EC14972");

            entity.ToTable("PaymentRequest");

            entity.HasIndex(e => e.OrderItemId, "IX_PaymentRequest_OrderItem");

            entity.HasIndex(e => new { e.Status, e.RequestDate }, "IX_PaymentRequest_Status_Date").IsDescending(false, true);

            entity.HasIndex(e => new { e.UserId, e.Status, e.RequestDate }, "IX_PaymentRequest_User_Status").IsDescending(false, false, true);

            entity.Property(e => e.PaymentRequestId).HasColumnName("PaymentRequestID");
            entity.Property(e => e.Money).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.OrderItemId).HasColumnName("OrderItemID");
            entity.Property(e => e.RequestDate).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.OrderItem).WithMany(p => p.PaymentRequests)
                .HasForeignKey(d => d.OrderItemId)
                .HasConstraintName("FK__PaymentRe__Order__778AC167");

            entity.HasOne(d => d.User).WithMany(p => p.PaymentRequests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PaymentRe__UserI__75A278F5");
        });

        modelBuilder.Entity<Plan>(entity =>
        {
            entity.HasKey(e => e.PlanId).HasName("PK__Plans__755C22B77D2993F0");

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
            entity.HasKey(e => e.PostId).HasName("PK__Posts__AA1260182E33C187");

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
                .HasConstraintName("FK__Posts__AuthorId__2CF2ADDF");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.PostDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__Posts__DeletedBy__30C33EC3");

            entity.HasMany(d => d.Books).WithMany(p => p.Posts)
                .UsingEntity<Dictionary<string, object>>(
                    "PostBook",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__PostBooks__BookI__395884C4"),
                    l => l.HasOne<Post>().WithMany()
                        .HasForeignKey("PostId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__PostBooks__PostI__3864608B"),
                    j =>
                    {
                        j.HasKey("PostId", "BookId");
                        j.ToTable("PostBooks");
                    });
        });

        modelBuilder.Entity<PostAttachment>(entity =>
        {
            entity.HasKey(e => e.AttachmentId).HasName("PK__PostAtta__442C64BE56C14397");

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
                .HasConstraintName("FK__PostAttac__PostI__339FAB6E");
        });

        modelBuilder.Entity<PostComment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__PostComm__C3B4DFCA299A1F29");

            entity.HasIndex(e => e.ParentCommentId, "IX_PostComments_Parent");

            entity.HasIndex(e => new { e.PostId, e.CreatedAt }, "IX_PostComments_PostTime");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.PostCommentDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__PostComme__Delet__44CA3770");

            entity.HasOne(d => d.ParentComment).WithMany(p => p.InverseParentComment)
                .HasForeignKey(d => d.ParentCommentId)
                .HasConstraintName("FK__PostComme__Paren__41EDCAC5");

            entity.HasOne(d => d.Post).WithMany(p => p.PostComments)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostComme__PostI__40F9A68C");

            entity.HasOne(d => d.User).WithMany(p => p.PostCommentUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostComme__UserI__42E1EEFE");
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
                .HasConstraintName("FK__PostReact__PostI__3C34F16F");

            entity.HasOne(d => d.User).WithMany(p => p.PostReactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__PostReact__UserI__3D2915A8");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42FCF399C5A60");

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
                .HasConstraintName("FK__Promotion__Owner__66603565");

            entity.HasMany(d => d.Books).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionApplication",
                    r => r.HasOne<Book>().WithMany()
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__BookI__6B24EA82"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__Promotion__Promo__6A30C649"),
                    j =>
                    {
                        j.HasKey("PromotionId", "BookId");
                        j.ToTable("PromotionApplications");
                    });
        });

        modelBuilder.Entity<ReadingSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__ReadingS__9C8A5B49720EF326");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Book).WithMany(p => p.ReadingSchedules)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReadingSc__BookI__236943A5");

            entity.HasOne(d => d.User).WithMany(p => p.ReadingSchedules)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ReadingSc__UserI__22751F6C");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1AFAD0659B");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B61602F3AA55E").IsUnique();

            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.SubscriptionId).HasName("PK__Subscrip__9A2B249DE848F946");

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
                .HasConstraintName("FK__Subscript__PlanI__59C55456");

            entity.HasOne(d => d.User).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Subscript__UserI__58D1301D");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C12B59440");

            entity.HasIndex(e => e.Email, "UQ__Users__A9D105346C4F7054").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__RoleI__4316F928"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__UserRoles__UserI__4222D4EF"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("UserRoles");
                    });
        });

        modelBuilder.Entity<UserFeedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__UserFeed__6A4BEDD65621C88C");

            entity.Property(e => e.Content).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TargetType)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.DeletedByNavigation).WithMany(p => p.UserFeedbackDeletedByNavigations)
                .HasForeignKey(d => d.DeletedBy)
                .HasConstraintName("FK__UserFeedb__Delet__0E6E26BF");

            entity.HasOne(d => d.FromUser).WithMany(p => p.UserFeedbackFromUsers)
                .HasForeignKey(d => d.FromUserId)
                .HasConstraintName("FK__UserFeedb__FromU__0C85DE4D");
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(e => new { e.FollowerId, e.FollowedId });

            entity.HasIndex(e => e.FollowedId, "IX_UserFollows_Followed");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Followed).WithMany(p => p.UserFollowFolloweds)
                .HasForeignKey(d => d.FollowedId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__29221CFB");

            entity.HasOne(d => d.Follower).WithMany(p => p.UserFollowFollowers)
                .HasForeignKey(d => d.FollowerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserFollo__Follo__282DF8C2");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__UserProf__1788CC4C48BE6728");

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
                .HasConstraintName("FK__UserProfi__UserI__3E52440B");
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.HasKey(e => e.WishlistId).HasName("PK__Wishlist__233189EBF5C92374");

            entity.HasIndex(e => new { e.UserId, e.BookId }, "UQ_Wishlists_UserBook").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Book).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.BookId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Wishlists__BookI__7C4F7684");

            entity.HasOne(d => d.User).WithMany(p => p.Wishlists)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Wishlists__UserI__7B5B524B");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
