-- =========================================================
-- Database
-- =========================================================
IF DB_ID(N'VieBook') IS NULL
BEGIN
  CREATE DATABASE VieBook;
END
GO
USE VieBook;
GO

-- =========================================================
-- Roles & Users
-- =========================================================
CREATE TABLE dbo.Roles (
  RoleId       INT IDENTITY(1,1) PRIMARY KEY,
  RoleName     VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.Users (
  UserId       INT IDENTITY(1,1) PRIMARY KEY,
  Email        VARCHAR(320) NOT NULL UNIQUE,
  PasswordHash VARBINARY(MAX) NULL,
  Status       VARCHAR(20) NOT NULL,              -- KHÔNG đặt CHECK/DEFAULT theo yêu cầu
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  LastLoginAt  DATETIME2 NULL,
  Wallet       DECIMAL(18,2) NOT NULL DEFAULT(0)
);

CREATE TABLE dbo.UserProfiles (
  UserId          INT PRIMARY KEY
                  REFERENCES dbo.Users(UserId),
  FullName        NVARCHAR(150) NULL,
  PhoneNumber     VARCHAR(30) NULL,
  DateOfBirth     DATE NULL,
  AvatarUrl       VARCHAR(500) NULL,
  Wallet          DECIMAL(18,2) NOT NULL DEFAULT(0)
);
ALTER TABLE dbo.UserProfiles ADD BankNumber VARCHAR(50) NULL;  -- số tài khoản
ALTER TABLE dbo.UserProfiles ADD BankName NVARCHAR(150) NULL;  -- tên ngân hàng

CREATE TABLE dbo.UserRoles (
  UserId INT NOT NULL REFERENCES dbo.Users(UserId),
  RoleId INT NOT NULL REFERENCES dbo.Roles(RoleId),
  CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId)
);

CREATE TABLE dbo.ExternalLogins (
  ExternalLoginId INT IDENTITY(1,1) PRIMARY KEY,
  UserId          INT NOT NULL REFERENCES dbo.Users(UserId),
  Provider        VARCHAR(50) NOT NULL,
  ProviderKey     VARCHAR(255) NOT NULL,
  CONSTRAINT UQ_ExternalLogin UNIQUE (Provider, ProviderKey)
);

CREATE TABLE dbo.PasswordResetTokens (
  TokenId     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  UserId      INT NOT NULL REFERENCES dbo.Users(UserId),
  TokenHash   VARBINARY(64) NOT NULL,
  ExpiresAt   DATETIME2 NOT NULL,
  UsedAt      DATETIME2 NULL,
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =========================================================
-- Categories
-- =========================================================
CREATE TABLE dbo.Categories (
  CategoryId  INT IDENTITY(1,1) PRIMARY KEY,
  Name        NVARCHAR(150) NOT NULL,
  Type        VARCHAR(20) NOT NULL, -- Genre/Subject...
  ParentId    INT NULL REFERENCES dbo.Categories(CategoryId),
  IsActive    BIT NOT NULL DEFAULT(1),
  CONSTRAINT UQ_Categories_NameType UNIQUE(Name, Type)
);

-- =========================================================
-- Books & Content
-- =========================================================
CREATE TABLE dbo.Books (
  BookId      INT IDENTITY(1,1) PRIMARY KEY,
  OwnerId     INT NOT NULL REFERENCES dbo.Users(UserId),
  Title       NVARCHAR(300) NOT NULL,
  Description NVARCHAR(MAX) NULL,
  CoverUrl    VARCHAR(1000) NULL,
  ISBN        VARCHAR(20) NULL UNIQUE,
  Language    VARCHAR(20) NULL,
  Status      VARCHAR(20) NOT NULL,              -- KHÔNG đặt CHECK/DEFAULT
  TotalView   INT NOT NULL DEFAULT(0),
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt   DATETIME2 NULL
);
CREATE INDEX IX_Books_Owner  ON dbo.Books(OwnerId);
CREATE INDEX IX_Books_Status ON dbo.Books(Status);

CREATE TABLE dbo.BookCategories (
  BookId     INT NOT NULL REFERENCES dbo.Books(BookId),
  CategoryId INT NOT NULL REFERENCES dbo.Categories(CategoryId),
  CONSTRAINT PK_BookCategories PRIMARY KEY (BookId, CategoryId)
);

-- Hợp nhất soft copy & audio theo chương
CREATE TABLE dbo.Chapters (
  ChapterId        INT IDENTITY(1,1) PRIMARY KEY,
  BookId           INT NOT NULL REFERENCES dbo.Books(BookId),
  ChapterTitle     NVARCHAR(500) NOT NULL,
  ChapterView      INT NOT NULL DEFAULT(0),
  ChapterSoftUrl   VARCHAR(1000) NULL,
  TotalPage        INT NULL,
  ChapterAudioUrl  VARCHAR(1000) NULL,
  DurationSec      INT NULL,
  PriceAudio       DECIMAL(18,2) NULL,
  StorageMeta      NVARCHAR(1000) NULL,
  UploadedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Chapters_Book ON dbo.Chapters(BookId);

CREATE TABLE dbo.BookApprovals (
  ApprovalId INT IDENTITY(1,1) PRIMARY KEY,
  BookId     INT NOT NULL REFERENCES dbo.Books(BookId),
  StaffId    INT NOT NULL REFERENCES dbo.Users(UserId),
  Action     VARCHAR(20) NOT NULL,               -- Approve/Reject (không CHECK)
  Reason     NVARCHAR(1000) NULL,
  CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =========================================================
-- Promotions / Gifts / Entitlements
-- =========================================================
CREATE TABLE dbo.Promotions (
  PromotionId   INT IDENTITY(1,1) PRIMARY KEY,
  OwnerId       INT NOT NULL REFERENCES dbo.Users(UserId),
  PromotionName NVARCHAR(200) NOT NULL,
  Description   NVARCHAR(1000) NULL,
  DiscountType  VARCHAR(10) NOT NULL,            -- Percent/Amount (không CHECK)
  DiscountValue DECIMAL(10,2) NOT NULL,
  Quantity      INT NOT NULL,
  StartAt       DATETIME2 NOT NULL,
  EndAt         DATETIME2 NOT NULL,
  IsActive      BIT NOT NULL DEFAULT(1)
);

CREATE TABLE dbo.PromotionApplications (
  PromotionId INT NOT NULL REFERENCES dbo.Promotions(PromotionId),
  BookId      INT NOT NULL REFERENCES dbo.Books(BookId),
  CONSTRAINT PK_PromotionApplications PRIMARY KEY (PromotionId, BookId)
);


-- =========================================================
-- OrderItems / Payments (không dùng Orders)
-- =========================================================
-- Bảng OrderItems: ghi nhận việc mua chương bằng xu
CREATE TABLE dbo.OrderItems (
    OrderItemId   BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId    INT NOT NULL REFERENCES dbo.Users(UserId),
    ChapterId     INT NOT NULL REFERENCES dbo.Chapters(ChapterId),
    UnitPrice     DECIMAL(18,2) NOT NULL, -- giá chương tại thời điểm mua (xu)
    CashSpent     DECIMAL(18,2) NOT NULL, -- số xu user đã trả
    PaidAt        DATETIME2 NULL,
    OrderType     VARCHAR(20) NULL        -- ví dụ: BuyChapter, BuyBundle
);
ALTER TABLE dbo.OrderItems
ADD CONSTRAINT CK_OrderItems_OrderType
CHECK (OrderType IN ('BuyChapter', 'Refund'));


-- Index để tra cứu nhanh
CREATE INDEX IX_OrderItems_Customer ON dbo.OrderItems(CustomerId, PaidAt);
CREATE INDEX IX_OrderItems_Chapter  ON dbo.OrderItems(ChapterId);


-- Bảng WalletTransactions: ghi nhận nạp xu từ tiền thật
CREATE TABLE dbo.WalletTransactions (
    WalletTransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId        INT NOT NULL REFERENCES dbo.Users(UserId),
    Provider      VARCHAR(50) NOT NULL,         -- VNPay/MoMo/PayPal
    TransactionId VARCHAR(200) NOT NULL,        -- mã giao dịch từ provider
    AmountMoney   DECIMAL(18,2) NOT NULL,       -- số tiền thật (VNĐ/USD)
    AmountCoin    DECIMAL(18,2) NOT NULL,       -- số xu quy đổi
    Status        VARCHAR(20) NOT NULL,         -- Pending/Succeeded/Failed
    CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_WalletTransactions UNIQUE (Provider, TransactionId)
);
ALTER TABLE dbo.WalletTransactions
ADD CONSTRAINT CK_WalletTransactions_Status
CHECK (Status IN ('Pending', 'Succeeded', 'Failed', 'Cancelled'));


-- Index gợi ý cho tra cứu
CREATE INDEX IX_WalletTransactions_User_Status
    ON dbo.WalletTransactions (UserId, Status, CreatedAt DESC);


-- Bảng PaymentRequests: tác giả yêu cầu rút tiền
CREATE TABLE dbo.PaymentRequests (
    PaymentRequestId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId        INT NOT NULL REFERENCES dbo.Users(UserId),
    RequestedCoin DECIMAL(18,2) NOT NULL,       -- số xu muốn rút
    Status        VARCHAR(20) NOT NULL 
                   DEFAULT 'Pending',           -- Pending/Accepted/Rejected
    RequestDate   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    AcceptDate    DATETIME2 NULL
);
ALTER TABLE dbo.PaymentRequests
ADD CONSTRAINT CK_PaymentRequests_Status
CHECK (Status IN ('Pending', 'Processing', 'Succeeded', 'Rejected'));


-- Index gợi ý
CREATE INDEX IX_PaymentRequests_User_Status
    ON dbo.PaymentRequests (UserId, Status, RequestDate DESC);

CREATE INDEX IX_PaymentRequests_Status_Date
    ON dbo.PaymentRequests (Status, RequestDate DESC);

-- =========================================================
-- User Interactions
-- =========================================================
CREATE TABLE dbo.Wishlists (
  WishlistId INT IDENTITY(1,1) PRIMARY KEY,
  UserId     INT NOT NULL REFERENCES dbo.Users(UserId),
  BookId     INT NOT NULL REFERENCES dbo.Books(BookId),
  CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_Wishlists_UserBook UNIQUE(UserId, BookId)
);

CREATE TABLE dbo.Bookmarks (
  BookmarkId       INT IDENTITY(1,1) PRIMARY KEY,
  UserId           INT NOT NULL REFERENCES dbo.Users(UserId),
  BookId           INT NOT NULL REFERENCES dbo.Books(BookId),
  ChapterReadId    INT NULL REFERENCES dbo.Chapters(ChapterId),
  ChapterListenId  INT NULL REFERENCES dbo.Chapters(ChapterId),
  PagePosition     INT NULL,       -- trang hiện tại
  AudioPosition    INT NULL,       -- giây hiện tại
  CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Bookmarks_UserBook ON dbo.Bookmarks(UserId, BookId);

CREATE TABLE dbo.BookReviews (
  ReviewId  INT IDENTITY(1,1) PRIMARY KEY,
  BookId    INT NOT NULL REFERENCES dbo.Books(BookId),
  UserId    INT NOT NULL REFERENCES dbo.Users(UserId),
  Rating    TINYINT NOT NULL,
  Comment   NVARCHAR(2000) NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_BookReviews UNIQUE(BookId, UserId)
);
CREATE INDEX IX_BookReviews_Book ON dbo.BookReviews(BookId);

CREATE TABLE dbo.UserFeedbacks (
  FeedbackId  INT IDENTITY(1,1) PRIMARY KEY,
  FromUserId  INT NULL REFERENCES dbo.Users(UserId),
  Content     NVARCHAR(2000) NOT NULL,
  TargetType  VARCHAR(20) NOT NULL,   -- HeThong/Sach/DonHang/ChuSach/Khac
  TargetId    INT NULL,
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  DeletedBy   INT NULL REFERENCES dbo.Users(UserId),
  DeletedAt   DATETIME2 NULL
);

-- =========================================================
-- Chat & Notifications
-- =========================================================
CREATE TABLE dbo.ChatConversations (
  ConversationId BIGINT IDENTITY(1,1) PRIMARY KEY,
  CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.ChatParticipants (
  ConversationId BIGINT NOT NULL REFERENCES dbo.ChatConversations(ConversationId),
  UserId         INT    NOT NULL REFERENCES dbo.Users(UserId),
  RoleHint       VARCHAR(10) NULL,      -- Customer/Owner/Staff
  JoinedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_ChatParticipants PRIMARY KEY (ConversationId, UserId)
);

CREATE TABLE dbo.ChatMessages (
  MessageId      BIGINT IDENTITY(1,1) PRIMARY KEY,
  ConversationId BIGINT NOT NULL REFERENCES dbo.ChatConversations(ConversationId),
  SenderId       INT    NOT NULL REFERENCES dbo.Users(UserId),
  MessageText    NVARCHAR(MAX) NULL,
  AttachmentUrl  VARCHAR(1000) NULL,
  SentAt         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_ChatMessages_ConvTime ON dbo.ChatMessages(ConversationId, SentAt DESC);

CREATE TABLE dbo.Notifications (
  NotificationId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId         INT NOT NULL REFERENCES dbo.Users(UserId),
  Type           VARCHAR(30) NOT NULL,  -- Order/Approval/System/Message
  Title          NVARCHAR(200) NOT NULL,
  Body           NVARCHAR(1000) NULL,
  IsRead         BIT NOT NULL DEFAULT(0),
  CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Notifications_User ON dbo.Notifications(UserId, IsRead, CreatedAt DESC);

-- =========================================================
-- Reading
-- =========================================================
CREATE TABLE dbo.ReadingSchedules (
  ScheduleId   INT IDENTITY(1,1) PRIMARY KEY,
  UserId       INT NOT NULL REFERENCES dbo.Users(UserId),
  BookId       INT NOT NULL REFERENCES dbo.Books(BookId),
  BeginReadAt  DATETIME2 NOT NULL,
  ReadingTime  INT NOT NULL,           -- phút đọc dự kiến
  IsActive     BIT NOT NULL DEFAULT(1),
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =========================================================
-- Social (Follow) + Forum (no share, no comment-reaction)
-- =========================================================
CREATE TABLE dbo.UserFollows (
  FollowerId INT NOT NULL REFERENCES dbo.Users(UserId),
  FollowedId INT NOT NULL REFERENCES dbo.Users(UserId),
  CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_UserFollows PRIMARY KEY (FollowerId, FollowedId)
);
CREATE INDEX IX_UserFollows_Followed ON dbo.UserFollows(FollowedId);

CREATE TABLE dbo.Posts (
  PostId         BIGINT IDENTITY(1,1) PRIMARY KEY,
  AuthorId       INT NOT NULL REFERENCES dbo.Users(UserId),
  Content        NVARCHAR(MAX) NULL,
  PostType       VARCHAR(20) NULL,      -- KHÔNG CHECK để bạn tự do thay đổi
  Visibility     VARCHAR(20) NOT NULL,  -- Public/Followers/Private (không CHECK)
  CommentCount   INT NOT NULL DEFAULT(0),
  ReactionCount  INT NOT NULL DEFAULT(0),
  CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt      DATETIME2 NULL,
  DeletedAt      DATETIME2 NULL,
  DeletedBy      INT NULL REFERENCES dbo.Users(UserId)
);
CREATE INDEX IX_Posts_AuthorTime ON dbo.Posts(AuthorId, CreatedAt DESC);
CREATE INDEX IX_Posts_Visibility ON dbo.Posts(Visibility, CreatedAt DESC);

CREATE TABLE dbo.PostAttachments (
  AttachmentId BIGINT IDENTITY(1,1) PRIMARY KEY,
  PostId       BIGINT NOT NULL REFERENCES dbo.Posts(PostId),
  FileType     VARCHAR(20) NOT NULL,     -- Image/Video/File
  FileUrl      VARCHAR(1000) NOT NULL,
  Meta         NVARCHAR(1000) NULL,
  SortOrder    INT NOT NULL DEFAULT(0),
  UploadedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_PostAttachments_Post ON dbo.PostAttachments(PostId, SortOrder);

CREATE TABLE dbo.PostBooks (
  PostId BIGINT NOT NULL REFERENCES dbo.Posts(PostId),
  BookId INT    NOT NULL REFERENCES dbo.Books(BookId),
  CONSTRAINT PK_PostBooks PRIMARY KEY (PostId, BookId)
);

CREATE TABLE dbo.PostReactions (
  PostId       BIGINT NOT NULL REFERENCES dbo.Posts(PostId),
  UserId       INT    NOT NULL REFERENCES dbo.Users(UserId),
  ReactionType VARCHAR(10) NOT NULL,     -- Like/Love/Haha/Wow/Sad/Angry (không CHECK)
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT PK_PostReactions PRIMARY KEY (PostId, UserId)
);
CREATE INDEX IX_PostReactions_Type ON dbo.PostReactions(ReactionType);

CREATE TABLE dbo.PostComments (
  CommentId        BIGINT IDENTITY(1,1) PRIMARY KEY,
  PostId           BIGINT NOT NULL REFERENCES dbo.Posts(PostId),
  ParentCommentId  BIGINT NULL REFERENCES dbo.PostComments(CommentId),
  UserId           INT NOT NULL REFERENCES dbo.Users(UserId),
  Content          NVARCHAR(MAX) NOT NULL,
  CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt        DATETIME2 NULL,
  DeletedAt        DATETIME2 NULL,
  DeletedBy        INT NULL REFERENCES dbo.Users(UserId)
);
CREATE INDEX IX_PostComments_PostTime ON dbo.PostComments(PostId, CreatedAt);
CREATE INDEX IX_PostComments_Parent   ON dbo.PostComments(ParentCommentId);

-- Tặng sách qua bài viết
CREATE TABLE dbo.BookOffers (
  BookOfferId BIGINT IDENTITY(1,1) PRIMARY KEY,
  PostId      BIGINT NOT NULL UNIQUE REFERENCES dbo.Posts(PostId), -- 1-1
  OwnerId     INT    NOT NULL REFERENCES dbo.Users(UserId),
  BookId      INT    NOT NULL REFERENCES dbo.Books(BookId),
  AccessType  VARCHAR(10) NOT NULL,   -- Soft/Audio/Both
  Quantity    INT NOT NULL DEFAULT(1),
  Criteria    NVARCHAR(1000) NULL,
  StartAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  EndAt       DATETIME2 NULL,
  Status      VARCHAR(20) NOT NULL     -- KHÔNG CHECK/DEFAULT theo yêu cầu
);
CREATE INDEX IX_BookOffers_Owner ON dbo.BookOffers(OwnerId);

CREATE TABLE dbo.BookClaims (
  ClaimId      BIGINT IDENTITY(1,1) PRIMARY KEY,
  BookOfferId  BIGINT NOT NULL REFERENCES dbo.BookOffers(BookOfferId),
  CustomerId   INT    NOT NULL REFERENCES dbo.Users(UserId),
  Note         NVARCHAR(500) NULL,
  Status       VARCHAR(20) NOT NULL,  -- Pending/Approved/Rejected/Granted (không CHECK)
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ProcessedAt  DATETIME2 NULL,
  ProcessedBy  INT NULL REFERENCES dbo.Users(UserId)
);
CREATE INDEX IX_BookClaims_Offer    ON dbo.BookClaims(BookOfferId, Status);
CREATE INDEX IX_BookClaims_Customer ON dbo.BookClaims(CustomerId, CreatedAt DESC);

-- =========================================================
-- Plans (siêu gọn) & Subscriptions (không dính Orders)
-- =========================================================
CREATE TABLE dbo.Plans (
  PlanId     INT IDENTITY(1,1) PRIMARY KEY,
  Name       NVARCHAR(200) NOT NULL,
  ForRole    VARCHAR(10) NOT NULL,       -- Owner/Customer (không CHECK)
  Period     VARCHAR(10) NOT NULL,       -- OneTime/Monthly/Yearly
  Price      DECIMAL(18,2) NOT NULL,
  Currency   VARCHAR(10) NOT NULL DEFAULT('VND'),
  TrialDays  INT NULL,
  Status     VARCHAR(20) NOT NULL,       -- KHÔNG CHECK/DEFAULT
  CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Plans_ForRoleStatus ON dbo.Plans(ForRole, Status);

CREATE TABLE dbo.Subscriptions (
  SubscriptionId   BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId           INT NOT NULL REFERENCES dbo.Users(UserId),
  PlanId           INT NOT NULL REFERENCES dbo.Plans(PlanId),
  Status           VARCHAR(20) NOT NULL,   -- Active/Cancelled/Expired (không CHECK/DEFAULT)
  AutoRenew        BIT NOT NULL DEFAULT(1),
  StartAt          DATETIME2 NOT NULL,
  EndAt            DATETIME2 NOT NULL,
  CancelAt         DATETIME2 NULL,
  CreatedAt        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Subscriptions_UserStatus ON dbo.Subscriptions(UserId, Status);
CREATE INDEX IX_Subscriptions_PlanStatus ON dbo.Subscriptions(PlanId, Status);
GO
USE VieBook;
GO

/* =========================================================
   Biến tiện dụng (lấy id theo email/tên)
   ========================================================= */

-- Roles
INSERT INTO dbo.Roles(RoleName) VALUES ('Admin'),('Staff'),('Owner'),('Customer');

-- Users
INSERT INTO dbo.Users(Email, PasswordHash, Status)
VALUES
  ('admin@viebook.local',  NULL, 'Active'),
  ('staff@viebook.local',  NULL, 'Active'),
  ('owner@viebook.local',  NULL, 'Active'),
  ('alice@viebook.local',  NULL, 'Active'),
  ('bob@viebook.local',    NULL, 'Active');

-- UserProfiles (kèm Bank)
INSERT INTO dbo.UserProfiles(UserId, FullName, PhoneNumber, DateOfBirth, AvatarUrl, Wallet)
SELECT UserId, 'System Admin',  '0900000001', '1990-01-01', 'https://cdn/vb/admin.png', 0
FROM dbo.Users WHERE Email='admin@viebook.local';
INSERT INTO dbo.UserProfiles(UserId, FullName, PhoneNumber, DateOfBirth, AvatarUrl, Wallet)
SELECT UserId, 'Support Staff', '0900000002', '1992-02-02', 'https://cdn/vb/staff.png', 0
FROM dbo.Users WHERE Email='staff@viebook.local';
INSERT INTO dbo.UserProfiles(UserId, FullName, PhoneNumber, DateOfBirth, AvatarUrl, Wallet)
SELECT UserId, 'Book Owner',    '0900000003', '1993-03-03', 'https://cdn/vb/owner.png', 150000
FROM dbo.Users WHERE Email='owner@viebook.local';
INSERT INTO dbo.UserProfiles(UserId, FullName, PhoneNumber, DateOfBirth, AvatarUrl, Wallet)
SELECT UserId, 'Alice',         '0900000004', '1995-04-04', 'https://cdn/vb/alice.png', 50000
FROM dbo.Users WHERE Email='alice@viebook.local';
INSERT INTO dbo.UserProfiles(UserId, FullName, PhoneNumber, DateOfBirth, AvatarUrl, Wallet)
SELECT UserId, 'Bob',           '0900000005', '1996-05-05', 'https://cdn/vb/bob.png',   20000
FROM dbo.Users WHERE Email='bob@viebook.local';

-- Bank info
UPDATE up SET BankNumber='012345678901', BankName=N'Vietcombank'
FROM dbo.UserProfiles up JOIN dbo.Users u ON up.UserId=u.UserId
WHERE u.Email='owner@viebook.local';
UPDATE up SET BankNumber='111122223333', BankName=N'Techcombank'
FROM dbo.UserProfiles up JOIN dbo.Users u ON up.UserId=u.UserId
WHERE u.Email='alice@viebook.local';

-- Gán Roles
INSERT INTO dbo.UserRoles(UserId, RoleId)
SELECT u.UserId, r.RoleId FROM dbo.Users u CROSS JOIN dbo.Roles r WHERE u.Email='admin@viebook.local' AND r.RoleName='Admin';
INSERT INTO dbo.UserRoles(UserId, RoleId)
SELECT u.UserId, r.RoleId FROM dbo.Users u CROSS JOIN dbo.Roles r WHERE u.Email='staff@viebook.local' AND r.RoleName='Staff';
INSERT INTO dbo.UserRoles(UserId, RoleId)
SELECT u.UserId, r.RoleId FROM dbo.Users u CROSS JOIN dbo.Roles r WHERE u.Email='owner@viebook.local' AND r.RoleName='Owner';
INSERT INTO dbo.UserRoles(UserId, RoleId)
SELECT u.UserId, r.RoleId FROM dbo.Users u CROSS JOIN dbo.Roles r WHERE u.Email IN ('alice@viebook.local','bob@viebook.local') AND r.RoleName='Customer';

-- Biến ID người dùng
DECLARE @AdminId INT  = (SELECT UserId FROM dbo.Users WHERE Email='admin@viebook.local');
DECLARE @StaffId INT  = (SELECT UserId FROM dbo.Users WHERE Email='staff@viebook.local');
DECLARE @OwnerId INT  = (SELECT UserId FROM dbo.Users WHERE Email='owner@viebook.local');
DECLARE @AliceId INT  = (SELECT UserId FROM dbo.Users WHERE Email='alice@viebook.local');
DECLARE @BobId   INT  = (SELECT UserId FROM dbo.Users WHERE Email='bob@viebook.local');



/* =========================================================
   Categories
   ========================================================= */
INSERT INTO dbo.Categories(Name, Type, ParentId, IsActive)
VALUES
 (N'Fiction',      'Genre',   NULL, 1),
 (N'Self-Help',    'Genre',   NULL, 1),
 (N'Technology',   'Subject', NULL, 1),
 (N'Programming',  'Subject', (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Technology' AND Type='Subject'), 1);



/* =========================================================
   Books & Chapters
   ========================================================= */
-- Books by Owner
INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView)
VALUES
  (@OwnerId, N'The Art of Reading', N'Guide to effective reading habits.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1524369581i/39105249.jpg', '9780000000011', 'EN', 'Approved', 120),
  (@OwnerId, N'C# for Beginners',   N'Introductory C# programming.',       'https://m.media-amazon.com/images/I/71KX3DYaCiL._UF894,1000_QL80_.jpg', '9780000000028', 'EN', 'Approved', 85);


DECLARE @Book1Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'The Art of Reading');
DECLARE @Book2Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'C# for Beginners');

-- Map categories
INSERT INTO dbo.BookCategories(BookId, CategoryId)
VALUES
  (@Book1Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre')),
  (@Book2Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Programming' AND Type='Subject'));

-- Chapters
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
VALUES
  (@Book1Id, N'Why Read',             50, 'https://cdn/vb/b1/ch1.pdf', 12, 'https://cdn/vb/b1/ch1.mp3', 600, 12000),
  (@Book1Id, N'Building a Habit',     40, 'https://cdn/vb/b1/ch2.pdf', 10, 'https://cdn/vb/b1/ch2.mp3', 540, 12000),
  (@Book1Id, N'Choosing Books',       30, 'https://cdn/vb/b1/ch3.pdf', 11, 'https://cdn/vb/b1/ch3.mp3', 570, 12000),
  (@Book2Id, N'Hello C#',             45, 'https://cdn/vb/b2/ch1.pdf', 14, 'https://cdn/vb/b2/ch1.mp3', 660, 15000),
  (@Book2Id, N'Variables & Types',    40, 'https://cdn/vb/b2/ch2.pdf', 16, 'https://cdn/vb/b2/ch2.mp3', 780, 15000);

DECLARE @B1C1 INT = (SELECT TOP 1 ChapterId FROM dbo.Chapters WHERE BookId=@Book1Id ORDER BY ChapterId);
DECLARE @B2C1 INT = (SELECT TOP 1 ChapterId FROM dbo.Chapters WHERE BookId=@Book2Id ORDER BY ChapterId);

-- Staff approves
INSERT INTO dbo.BookApprovals(BookId, StaffId, Action, Reason)
VALUES
  (@Book1Id, @StaffId, 'Approve', NULL),
  (@Book2Id, @StaffId, 'Approve', NULL);



/* =========================================================
   Promotions
   ========================================================= */
INSERT INTO dbo.Promotions(OwnerId, PromotionName, Description, DiscountType, DiscountValue, Quantity, StartAt, EndAt, IsActive)
VALUES (@OwnerId, N'Back to School', N'20% off selected programming chapters', 'Percent', 20.00, 100,
        DATEADD(DAY,-3,SYSUTCDATETIME()), DATEADD(DAY,30,SYSUTCDATETIME()), 1);

INSERT INTO dbo.PromotionApplications(PromotionId, BookId)
SELECT TOP 1 PromotionId, @Book2Id FROM dbo.Promotions ORDER BY PromotionId DESC;



/* =========================================================
   Ví dụ dữ liệu demo cho WalletTransactions / OrderItems / PaymentRequests
   ========================================================= */

-- 1. Alice nạp xu qua VNPay (Succeeded)
INSERT INTO dbo.WalletTransactions(UserId, Provider, TransactionId, AmountMoney, AmountCoin, Status, CreatedAt)
VALUES
  (@AliceId, 'VNPay', 'TXN-A-0001', 20000, 20000, 'Succeeded', SYSUTCDATETIME());

-- 2. Alice dùng xu để mua 2 chương
INSERT INTO dbo.OrderItems(CustomerId, ChapterId, UnitPrice, CashSpent, PaidAt, OrderType)
VALUES
  (@AliceId, @B1C1, 12000, 12000, SYSUTCDATETIME(), 'BuyChapter'),
  (@AliceId, @B2C1, 15000, 15000, SYSUTCDATETIME(), 'BuyChapter');

-- 3. Chủ sách (Owner) yêu cầu rút xu
INSERT INTO dbo.PaymentRequests(UserId, RequestedCoin, Status, RequestDate, AcceptDate)
VALUES
  (@OwnerId, 100000, 'Pending', SYSUTCDATETIME(), NULL),
  (@OwnerId,  50000, 'Succeeded', DATEADD(DAY,-1,SYSUTCDATETIME()), SYSUTCDATETIME());




/* =========================================================
   User Interactions
   ========================================================= */
-- Wishlists
INSERT INTO dbo.Wishlists(UserId, BookId)
VALUES
  (@AliceId, @Book1Id),
  (@BobId,   @Book2Id);

-- Bookmarks
INSERT INTO dbo.Bookmarks(UserId, BookId, ChapterReadId, PagePosition, AudioPosition)
VALUES
  (@AliceId, @Book1Id, @B1C1, 5, NULL);

-- Reviews
INSERT INTO dbo.BookReviews(BookId, UserId, Rating, Comment)
VALUES
  (@Book1Id, @AliceId, 5, N'Rất hữu ích để xây thói quen đọc!');

-- Feedbacks
INSERT INTO dbo.UserFeedbacks(FromUserId, Content, TargetType, TargetId)
VALUES
  (@AliceId, N'Ứng dụng mượt, giao diện dễ dùng.', 'HeThong', NULL);



/* =========================================================
   Chat & Notifications
   ========================================================= */
-- Tạo 1 cuộc chat giữa Alice và Owner
INSERT INTO dbo.ChatConversations DEFAULT VALUES;
DECLARE @ConvId BIGINT = SCOPE_IDENTITY();

INSERT INTO dbo.ChatParticipants(ConversationId, UserId, RoleHint)
VALUES
  (@ConvId, @AliceId, 'Customer'),
  (@ConvId, @OwnerId, 'Owner');

INSERT INTO dbo.ChatMessages(ConversationId, SenderId, MessageText)
VALUES
  (@ConvId, @AliceId, N'Chào anh, em muốn hỏi về chương 2 của sách ạ.'),
  (@ConvId, @OwnerId, N'Chào em, chương 2 nói kỹ hơn về xây thói quen, em gặp vướng chỗ nào?');

-- Notifications
INSERT INTO dbo.Notifications(UserId, Type, Title, Body)
VALUES
  (@OwnerId, 'Order',   N'Đơn hàng mới', N'Alice vừa mua chương mới.'),
  (@AliceId, 'System',  N'Chào mừng',     N'Cảm ơn bạn đã đăng ký VieBook!');



/* =========================================================
   Reading
   ========================================================= */
INSERT INTO dbo.ReadingSchedules(UserId, BookId, BeginReadAt, ReadingTime, IsActive)
VALUES
  (@AliceId, @Book1Id, DATEADD(HOUR,2,SYSUTCDATETIME()), 30, 1);



/* =========================================================
   Social + Forum
   ========================================================= */
-- Follow
INSERT INTO dbo.UserFollows(FollowerId, FollowedId)
VALUES
  (@AliceId, @OwnerId),
  (@BobId,   @OwnerId);

-- Posts
INSERT INTO dbo.Posts(AuthorId, Content, PostType, Visibility, CommentCount, ReactionCount)
VALUES
  (@OwnerId, N'Chia sẻ tips đọc sách mỗi ngày 20 phút!', 'Normal', 'Public', 0, 0);

DECLARE @Post1 BIGINT = (SELECT TOP 1 PostId FROM dbo.Posts WHERE AuthorId=@OwnerId ORDER BY CreatedAt DESC);

-- Attachments & tag book
INSERT INTO dbo.PostAttachments(PostId, FileType, FileUrl, Meta, SortOrder)
VALUES
  (@Post1, 'Image', 'https://cdn/vb/post1/img1.jpg', NULL, 0);

INSERT INTO dbo.PostBooks(PostId, BookId) VALUES (@Post1, @Book1Id);

-- Reactions
INSERT INTO dbo.PostReactions(PostId, UserId, ReactionType)
VALUES
  (@Post1, @AliceId, 'Like'),
  (@Post1, @BobId,   'Love');

-- Comments (thread: 1 bình luận gốc + 1 trả lời)
INSERT INTO dbo.PostComments(PostId, ParentCommentId, UserId, Content)
VALUES
  (@Post1, NULL, @AliceId, N'Bài viết hay quá! Em sẽ thử.');   -- cmt gốc

DECLARE @RootCmt BIGINT = (SELECT TOP 1 CommentId FROM dbo.PostComments WHERE PostId=@Post1 AND ParentCommentId IS NULL ORDER BY CommentId);

INSERT INTO dbo.PostComments(PostId, ParentCommentId, UserId, Content)
VALUES
  (@Post1, @RootCmt, @OwnerId, N'Cảm ơn em, cố gắng mỗi ngày nhé!');

-- Post tặng sách (Gift) + claim
INSERT INTO dbo.Posts(AuthorId, Content, PostType, Visibility, CommentCount, ReactionCount)
VALUES
  (@OwnerId, N'Tặng 5 suất đọc audiobook chương 1!', 'Gift', 'Public', 0, 0);
DECLARE @GiftPost BIGINT = SCOPE_IDENTITY();

INSERT INTO dbo.BookOffers(PostId, OwnerId, BookId, AccessType, Quantity, Criteria, Status)
VALUES
  (@GiftPost, @OwnerId, @Book1Id, 'Audio', 5, N'Random 5 bạn comment sớm nhất', 'Active');

DECLARE @OfferId BIGINT = (SELECT BookOfferId FROM dbo.BookOffers WHERE PostId=@GiftPost);

INSERT INTO dbo.BookClaims(BookOfferId, CustomerId, Note, Status)
VALUES
  (@OfferId, @AliceId, N'Em muốn nghe thử ạ!', 'Pending'),
  (@OfferId, @BobId,   N'Cho mình xin 1 suất nhé!', 'Pending');



/* =========================================================
   Plans & Subscriptions (siêu gọn)
   ========================================================= */
INSERT INTO dbo.Plans(Name, ForRole, Period, Price, Currency, TrialDays, Status)
VALUES
  (N'Reader Plus', 'Customer', 'Monthly', 49000, 'VND', 7, 'Active'),
  (N'Owner Pro',   'Owner',    'Monthly', 99000, 'VND', NULL, 'Active');

DECLARE @ReaderPlanId INT = (SELECT PlanId FROM dbo.Plans WHERE Name=N'Reader Plus');
DECLARE @OwnerPlanId  INT = (SELECT PlanId FROM dbo.Plans WHERE Name=N'Owner Pro');

-- Subscriptions
INSERT INTO dbo.Subscriptions(UserId, PlanId, Status, AutoRenew, StartAt, EndAt, CreatedAt)
VALUES
  (@AliceId, @ReaderPlanId, 'Active', 1, SYSUTCDATETIME(), DATEADD(MONTH,1,SYSUTCDATETIME()), SYSUTCDATETIME()),
  (@OwnerId, @OwnerPlanId,  'Active', 1, SYSUTCDATETIME(), DATEADD(MONTH,1,SYSUTCDATETIME()), SYSUTCDATETIME());
GO


/* =========================================================
   Một số thống kê nhanh để kiểm tra dữ liệu
   ========================================================= */
-- Người dùng & vai trò
SELECT u.UserId, u.Email, STRING_AGG(r.RoleName, ', ') AS Roles
FROM dbo.Users u
LEFT JOIN dbo.UserRoles ur ON ur.UserId=u.UserId
LEFT JOIN dbo.Roles r ON r.RoleId=ur.RoleId
GROUP BY u.UserId, u.Email
ORDER BY u.UserId;

-- Sách & chương
SELECT b.BookId, b.Title, COUNT(c.ChapterId) AS ChapterCount
FROM dbo.Books b LEFT JOIN dbo.Chapters c ON c.BookId=b.BookId
GROUP BY b.BookId, b.Title;

-- Bài viết & comment
SELECT p.PostId, p.PostType, p.Visibility,
       (SELECT COUNT(*) FROM dbo.PostComments pc WHERE pc.PostId=p.PostId) AS Comments,
       (SELECT COUNT(*) FROM dbo.PostReactions pr WHERE pr.PostId=p.PostId) AS Reactions
FROM dbo.Posts p
ORDER BY p.PostId DESC;

-- Add author to table Books
ALTER TABLE Books
ADD Author NVARCHAR(255) NULL;