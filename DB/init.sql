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

CREATE TABLE dbo.RefreshTokens (
  TokenId        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  UserId         INT NOT NULL REFERENCES dbo.Users(UserId),
  TokenHash      VARCHAR(255) NOT NULL,
  ExpiresAt      DATETIME2 NOT NULL,
  CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  RevokedAt      DATETIME2 NULL,
  ReplacedByToken VARCHAR(255) NULL,
  ReasonRevoked  VARCHAR(500) NULL
);
CREATE INDEX IX_RefreshTokens_User ON dbo.RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_TokenHash ON dbo.RefreshTokens(TokenHash);
CREATE INDEX IX_RefreshTokens_ExpiresAt ON dbo.RefreshTokens(ExpiresAt);

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
IF NOT EXISTS (SELECT 1 FROM dbo.Books WHERE Title=N'The Art of Reading')
BEGIN
INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView)
VALUES
  (@OwnerId, N'The Art of Reading', N'Guide to effective reading habits.', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1524369581i/39105249.jpg', '97800000000119', 'EN', 'Approved', 120),
  (@OwnerId, N'Miền Bắc - Một Thời Chiến Tranh Một Thời Hòa Bình',   N'**Miền Bắc - Một thời ế , một thời hòa bình của tác giả Folke Isaksson và Hình ảnh của Jean Hermanson/Saftra: Hành trình khắc sâu lịch sử**

*Nước Việt Nam - Nơi hòa bình chế ngự chiến*

Nước Việt Nam, một đất nước xa xôi, nhưng lại gần gũi với trái tim mọi người. Nơi đây từng trải qua những thời kỳ chiến đầy khó khăn, thử thách nhưng giờ đây, bức tranh mới đang được vẽ, một bức tranh của hòa bình, sự kiến thiết và hy vọng tương lai tươi sáng.

*Một thời kỳ mới bắt đầu - Hình ảnh từ miền Bắc Việt Nam*

Cuốn sách "Miền Bắc - Một thời chiến tranh, một thời hòa bình" không chỉ tập hợp những bài viết chân thật của tác giả Folke Isaksson và hình ảnh của Jean Hermanson/Saftra về cuộc sống chưa từng công bố của nhân dân miền Bắc trải qua trong giai đoạn khi chiến Mỹ muốn Miền Bắc "trở về thời kỳ đồ đá", mà còn là một câu chuyện về sự đồng lòng, sức mạnh và lòng yêu nước.

*Những hình ảnh bình dị về phong cảnh, văn hóa và cuộc sống hằng ngày*

Trang sách mở ra với những hình ảnh tuyệt vời về phong cảnh hùng vĩ, văn hóa độc đáo và cuộc sống bình dị của những người dân miền Bắc. Trong trường học, gia đình, khi lao động trên cánh đồng và trong các xưởng sản xuất, hình ảnh những chiếc xe đạp thồ, những nụ cười trong sáng, chúng ta sẽ cảm nhận được tình yêu thương và sức sống mạnh mẽ.

"Miền Bắc - Một thời chiến , một thời hòa bình" không chỉ là một cuốn sách lịch sử, mà còn là một lời kêu gọi đến tất cả chúng ta hãy chung tay xây dựng một tương lai hòa bình, một tương lai mà mọi người Việt Nam xứng đáng và tự hào.',       'https://cdn1.fahasa.com/media/catalog/product/9/7/9786044700243.jpg', '9780000000099', 'VIE', 'Approved', 130),
  (@OwnerId, N'Lịch Sử Các Nước Ven Địa Trung Hải - Bìa Cứng',   N'Đến với “Vùng đất của mặt trời” với những con sóng xô bờ, những bờ biển tuyệt đẹp của Địa Trung Hải, chắc hẳn ai cũng sẽ phải choáng ngợp với cảnh vật thật hùng vĩ. Nằm giữa các vĩ tuyến 35 - 45 và kéo dài trên 5.000km, vùng đất phía nam châu Âu này được thiên nhiên ưu đãi một khí hậu tuyệt vời mà chắc hẳn sẽ khiến bạn nhớ đến các địa điểm du lịch nổi tiếng bãi biển Côte d’Azur, Riviera, Costa Brava, quần đảo Balearic, các đảo của Hy Lạp hay hàng trăm địa điểm lý tưởng khác.

Đối với du khách là thế, nhưng đối với những nhà nghiên cứu văn hóa, Địa Trung Hải chính là cái nôi của nền văn minh nhân loại, là vùng lõi mà ở đó và các vùng tiệm cận, những nền văn hóa rực rỡ nhất đã hình thành. Nhằm cung cấp những thông tin thú vị và hữu ích về vùng đất này, MaiHaBooks xin giới thiệu tới bạn đọc ấn phẩm “LỊCH SỬ CÁC NƯỚC VEN ĐỊA TRUNG HẢI”. Qua từng trang sách, bạn đọc sẽ cùng khám phá những đặc trưng như khí hậu, cảnh vật, đời sống con người của vùng Địa Trung Hải. Hãy cùng giải đáp những câu hỏi mà bạn đặt ra về những nền văn minh cổ đại trên miền đất này các bạn nhé!

“Thật đáng ngạc nhiên vì thế giới nghèo nàn và khô cằn này lại là cái nôi văn minh của nhân loại. Chỉ cần nghĩ đến vai trò nguyên thủy của các Pharaoh ở Ai Cập ta sẽ hiểu.” - GLOBERAMA.',       'https://cdn1.fahasa.com/media/catalog/product/9/7/9786044708904.jpg', '9780000000012', 'VIE', 'Approved', 115),
  (@OwnerId, N'Bài Giảng Lịch Sử An Nam',   N'MỘT TRONG NHỮNG CÔNG TRÌNH NGHIÊN CỨU ĐẦY GIÁ TRỊ VỀ LỊCH SỬ AN NAM!

Bài giảng lịch sử An Nam là công trình được Trương Vĩnh Ký tổng hợp và nghiên cứu từ nhiều nguồn tư liệu, viết về lịch sử Việt Nam xuyên suốt các thời kỳ, từ triều đại Hồng Bàng thị, trải qua một ngàn năm Bắc thuộc, cho đến thời kỳ đầu Pháp tiến vào Việt Nam. Tác phẩm này vốn được biên soạn nhằm mục đích giúp học trò của Trương Vĩnh Ký học ngoại ngữ thông qua lịch sử nước nhà, nên nội dung trong cuốn sách này hướng đến đại đa số người đọc phổ thông, khiến những câu chuyện lịch sử hiện lên một cách hết sức gần gũi, dễ hiểu.',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8935235240421.jpg', '9780000000022', 'VIE', 'Approved', 185),
  (@OwnerId, N'Tâm Lý Học Tội Phạm Vén Màn Bí Mật Biểu Cảm',   N'ĐỪNG NGHE LỜI HỌ NÓI! HÃY QUAN SÁT BIỂU CẢM CỦA HỌ!

Lập hồ sơ tội phạm là một nghề đặc thù được đào tạo bài bản, bắt đầu xuất hiện từ những năm 70 của Thế kỷ XX. Chuyên viên lập hồ sơ tội phạm thường phân tích thủ đoạn gây án, cách bố trí hiện trường… để đưa ra phán đoán về chủng tộc, giới tính, tuổi tác, nghề nghiệp, đặc trưng ngoại hình… của nghi phạm. Những thông tin vừa cụ thể vừa quan trọng này đều có đầu mối từ một số chi tiết rất nhỏ, chuyên viên lập hồ sơ tội phạm sẽ quan sát kỹ từng chi tiết để lần ra thông tin nghi phạm. Chức trách của chuyên viên lập hồ sơ tội phạm là giúp cảnh sát thu hẹp phạm vi tìm kiếm và kịp thời ngăn chặn hành vi phạm tội tiếp tục xảy ra.

Trong lịch sử, có rất nhiều vụ án sát nhân liên hoàn được phá nhờ sự hỗ trợ của chuyên viên lập hồ sơ tội phạm.

Tổ chức nổi tiếng nhất trong lĩnh vực này phải kể đến Đơn vị Phân tích hành vi (BAU) thuộc Cục Điều tra Liên bang Hoa Kỳ (FBI).

---

Tâm sinh tướng, khi hành động và lời nói của một người không thống nhất với nhau, chỉ một biểu cảm vô cùng nhỏ của người đó thôi cũng có thể tiết lộ sự thật.

Bạn có muốn nhìn thấu mọi thứ từ bây giờ, để đối phương không thể có bất kỳ bí mật nào trước mặt bạn?

Chuyên viên lập hồ sơ tội phạm sẽ giúp bạn hiểu rõ một người trong thời gian ngắn nhất, nhìn thấu nội tâm và hành vi của họ!',       'https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-tr_c---t_m-l_-h_c-t_i-ph_m-v_n-m_n-b_-m_t-bi_u-c_m.jpg', '9780000000041', 'VIE', 'Approved', 65),
  (@OwnerId, N'1111 - Nhật Ký Sáu Vạn Dặm Trên Yên Xe Cà Tàng',   N'Trần Đặng Đăng Khoa bắt đầu hành trình vạn dặm vòng quanh thế giới từ ngày 01/06/2017 tại cửa khẩu Mộc Bài (Tây Ninh). Với chiếc xe 100cc mang biển số Việt Nam, trong hành trình kéo dài 1.111 ngày, anh đã đặt chân tới 7 châu lục, 65 quốc gia và vùng lãnh thổ, băng qua đường xích đạo 8 lần. 
Mỗi ngày trong chuyến đi - trừ ba tháng cuối cùng kẹt ở Mozambique vì dịch COVID-19 - anh đều ghi lại nhật ký, và cuốn sách này chính là tập hợp những trang viết của anh theo mốc thời gian. Những trang du ký vút nhanh, xoay đều như những vòng bánh xe, cuốn ta theo cùng trong chuyến đi “không hẹn ngày về”. Những ngoạn mục của thiên nhiên, những sặc sỡ của văn hóa, những bình dị ấm áp của cuộc sống con người, cộng với những kinh nghiệm và trải nghiệm rất cá nhân của một kẻ độc hành ham phiêu lưu, tất cả hứa hẹn sẽ thỏa mãn trí tưởng tượng và tò mò của độc giả, truyền cảm hứng cho những đam mê xê dịch biến thành những chuyến đi tiếp nối.

Sách còn bao gồm Phụ lục: Từ ý tưởng đến hiện thực cung cấp tất cả các thông tin cần thiết để độc giả thực hiện một chuyến đi vòng quanh thế giới bằng xe máy. Phụ lục được thực hiện dưới dạng file sách để làm quà tặng cho độc giả. Độc giả quét mã QR trên bìa sách để đọc và tải file.',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8934974183037.jpg', '9780000000030', 'VIE', 'Approved', 25),
  (@OwnerId, N'Trên Đường Về Nhớ Đầy',   N'Trên Đường Về Nhớ Đầy

Những câu chuyện rủ rỉ, có duyên cùng những bức hình độc đáo có sức lôi kéo người đọc đọc mãi mà không muốn đặt sách xuống. Bạn đọc có thể thu nhận được rất nhiều từ cái nhìn thưởng lãm có phân tích của những trang viết, biết thêm về những địa danh tưởng như quen thuộc, hiểu thêm vùng đất, con người, văn hóa xứ khác.

“Đi theo bước chân du hành của Dương Thành Truyền qua năm tháng, người đọc cùng trải nghiệm sự thay đổi về không gian và lối sống của tác giả, nhưng cũng thu lượm được câu chuyện về một tiến trình biến chuyển của xã hội Việt Nam, từ chỗ là một nơi tách biệt với thế giới, đã trở thành một bến đi. Giống như đã đi từ một bến hẻo lánh ra với những điểm đến ngày càng hoành tráng hơn, kỳ vĩ hơn, ngạc nhiên này nối sửng sốt khác.”',       'https://cdn1.fahasa.com/media/catalog/product/n/x/nxbtre_full_08472018_094704.jpg', '9780000000021', 'EN', 'Approved', 285),
  (@OwnerId, N'Có Hẹn Với Paris',   N'Có Hẹn Với Paris

Có hẹn với Paris là tập đầu tiên trong loạt sách Amanda Huỳnh và sắc màu du ký, do chính tác giả viết, vẽ và thiết kế.
Cuốn du ký đầy những bức họa tuyệt đẹp này sẽ đưa độc giả đến với Paris, thành phố không chỉ nổi tiếng với những cảnh quan tráng lệ và lãng mạn mà còn lắm ngóc ngách bí mật, và nghe những câu chuyện mang màu sắc huyền thoại mà người Paris chưa hẳn đã biết hết. Như chuyện về nước giếng thần trong khuôn viên nhà thờ, bà phù thủy không tiên tri được số phận của chính mình hay lời nguyền của nàng công chúa giàu có và xinh đẹp trong nghĩa trang Père de la Chaise, cùng vô số bí ẩn thú vị khác phía sau những cánh cửa, con đường, góc phố…

Amanda Huỳnh là tác giả của tập truyện ngắn và tản văn LAM vừa xuất bản vào tháng 7.2016; các câu chuyện và tranh vẽ rực rỡ về tuổi thanh xuân với những được-mất, trong bối cảnh Paris cổ kính lãng mạn đã gây ấn tượng mạnh với độc giả. Sách đã nhanh chóng được tái bản ngay sau khi ra mắt.',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8934974147381.jpg', '97800000000110', 'VIE', 'Approved', 5),
  (@OwnerId, N'Cô Đơn Trên Everest',   N'Đây là cuốn du ký hay nhất tôi từng đọc. Cô Đơn Trên Everest có lẽ sẽ không khiến bất kỳ ai lật sách ra mà phải thất vọng. Một cuộc phiêu lưu bằng cả ngôn từ, thị giác lẫn xúc giác. Có lãng mạn, có xót xa, có đau đáu, có hài hước và đầy những hồi hộp như chính mình đang đi giữa cuộc hành trình. Đọc “Cô đơn trên Everest”, có đôi lúc tôi cảm nhận được mình đã nhìn thấy ảnh mặt trời đỏ ối vào lúc bình minh trên sông Hằng, có đôi khi, tôi rợn người vì cảnh người ta khuân củi chở đến lò thiêu xác.

Nhà báo Bùi Kiều Trang (Từ “Ngày nay”)

Di Li là nữ nhà văn đã có chuyến đi bão táp trên đất Ấn Độ ngay trước khi quốc gia này thiết lập lệnh phong tỏa vì đại dịch lần thứ nhất. Trong Cô Đơn Trên Everest, có tới non nửa dành kể những câu chuyện chị đã trải qua trên đất nước Ấn Độ. Di Li đã khiến người đọc đứng tim khi theo chị băng qua dãy núi tuyết Himalaya và dọc bờ sông Hằng. Sông Hằng, con sông thiêng của người Hindu, với đầy xác chết được đốt rồi thả xuống sông, có cả những người chết thiêng không đốt, cứ thế trôi trên sông, người ta phóng uế ở đấy, và tắm táp với lòng thành kính cũng ở đấy...

Nhà báo Võ Hồng Thu (Từ “Sức khỏe đời sống”)',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8936049957802.jpg', '9780000000010', 'VIE', 'Approved', 85),
  (@OwnerId, N'Vàng Son Một Thuở Ba Tư (Tập Du Ký)',   N'Bản năng sinh tồn của loài sinh vật hai chân quả thật kỳ vĩ dù bàn tay Thượng Đế cố tình đặt loài sinh vật nhỏ bé ấy vào trong những khối băng lạnh giá, cánh rừng già hoang vu hay đất đá khô khốc mùi hoang mạc. Bản năng sinh tồn ấy trỗi dậy để tìm lấy sự sống như cách ái phi Scheherazade đã kể cho vua Shahryar nghe những câu chuyện thần thoại và luôn kết thúc trong dở dang, gây tò mò khi ánh dương vừa ló rạng. Hàng đêm, khi ánh lửa liêu xiêu được thắp sáng trong cung điện, không gian nồng ấm mùi trầm Frankince, những xứ sở mới lạ hiện ra trong 1.001 câu chuyện thật sống động, lấp lánh sắc màu như suy nghĩ từ những người Hy Lạp đi trước mở đường, một phương Đông vô cùng huyền bí nhưng cũng là vùng đất đầy ma thuật, bùa ngải ẩn hiện vào những lọn tóc rắn của nữ quỷ Medusa...

Một vương triều Achaemenid của Đại đế Darius trỗi dậy từ thế kỷ 5 TCN quá hùng mạnh khiến người Hy Lạp không thể đặt chân đến Ba Tư khi họ luôn thất thủ tại eo biển Bophorus thuộc Thổ Nhĩ Kỳ ngày nay, trong khi đoàn quân thiện chiến Ba Tư liên tục vượt Địa Trung Hải mở những đợt vây hãm Hy Lạp. Nỗi buồn ghi thật sâu trong lòng những chiến binh Hy Lạp khi hoàng đế Ba Tư Xerxes I (519 - 465 TCN) đốt tan hoang pháo đài phòng thủ Acropolis ở thành Athen trong trận chiến mùa xuân 480 TCN. Khi trận chiến sống mái Plataea diễn ra năm 479 TCN đi qua, người Hy Lạp ca khúc khải hoàn bằng cây cột đồng dựng thẳng đứng và trên thân cột điêu khắc những con rắn ma quái phương Đông phủ phục và tôn vinh các vị thần của vùng đất Macedonia.

Không như nền văn minh Ai Cập với các vị thần hóa thân vào trong loài vật, Hy Lạp quá rực rỡ với các vị thần tuyệt đẹp đường nét bước ra từ bộ sử thi và là một trong những nền văn minh bản lề của phương Tây nên kẻ hậu bối như tôi chỉ nhớ đến công trạng hiển hách của Đại đế Alexandros của người Macedonia qua những trận chiến thần tốc khi ông xua đoàn quân thiện chiến về phương Đông. Tôi không biết được đại lộ giao thương Đông Tây từ đoạn Susa thuộc tỉnh Khuzestan - Iran đến Sardis - Thổ Nhĩ Kỳ ngày nay đã được Đại đế Darius xây dựng vào thế kỷ 5 TCN với tên gọi “Con đường Hoàng Gia”. Không còn huyền bí ma thuật như những lời đồn đãi, đoán mò của những người Hy Lạp trước đây, mà hành quân theo “Con đường Hoàng Gia” đã được người xưa thiết lập, Ba Tư trong ánh mắt của ông Alexandros vào thế kỷ 3 TCN là ngôi sao đích thực của mỹ thuật phương Đông với những đền đài lăng tẩm đẹp không sao tả xiết. Một nền văn minh rực rỡ của nhân loại được hỏa thần Ahura Mazda và nữ thủy thần Anahita ươm mầm sống trong lòng sa mạc rộng lớn.

Thuở bé thơ sống trong những câu chuyện cổ tích, tập truyện Ngàn lẻ một đêm được viết từ kinh đô Baghdad – Iraq dẫn lối tôi vào vương quốc thần tiên. Lớn hơn một chút, những áng thơ của các đại văn hào Ba Tư trong thời Trung cổ lại ru lứa tuổi mộng mơ vào giấc ngủ nên thơ. Và cho đến một ngày tâm hồn chuyển qua đam mê kiến trúc mỹ thuật, Ba Tư lại cuốn hút tôi bằng những viên gạch men nền nã được ốp trên những mái vòm hay các cổng chào theo nghệ thuật tổ ong. Một vài người bạn đồng hành nói rằng: “Ba Tư vẫn huyền thoại như những tác phẩm văn học cổ có sức ảnh hưởng rộng lớn trên vùng đất Nam - Trung - Tiểu Á và trên những vùng đất ấy vẫn còn giữ lại những phong tục cổ truyền của người xưa. Ba Tư vẫn long lanh nét đẹp phương Đông khi các kiến trúc sư phương Tây vay mượn mái vòm Ba Tư và nghệ thuật sân vườn để thiết kế những công trình lớn trên lục địa già cỗi, dù co cụm về lãnh thổ nhưng vẫn oai hùng một thuở khi rất ít vó ngựa viễn chinh từ bên kia Địa Trung Hải có thể băng ngang qua được vùng đất Ba Tư...”

Trong dòng chảy hiện đại, Ba Tư vẫn huyền bí đến mơ hồ khi tôi đọc qua các bản tin trên phương tiện truyền thông quốc tế.

Trỗi dậy từ bán đảo Tây Á vào thế kỷ 7, các vị vua Hồi chọn Ba Tư đầu tiên để truyền bá tôn giáo bởi ánh vàng son của vương quốc ấy có sức ảnh hưởng rộng khắp trên vùng đất châu Á.

Bước chân qua một vài vùng đất Hồi giáo trước đây, người địa phương kể rằng nghề dệt thảm có cội nguồn từ vùng đất Hồi giáo Ba Tư và nếu mua làm quà lưu niệm thì không đâu đẹp bằng Iran. Nét văn hóa từ ngàn xưa ấy được tôn vinh bằng câu chuyện chiếc thảm thần trong Aladin và chiếc đèn thần được phương Tây loan truyền bằng nhiều bộ phim cùng tên. Tôi muốn đến Iran vẫn còn trong giai đoạn tranh tối tranh sáng, không vì những lời khen ngợi can đảm từ bạn bè hay một chút kiêu hãnh trong lòng mà chỉ vì câu nói của người xưa “Vàng son một thuở Ba Tư”. Hai lần đến Iran theo tiếng gọi đam mê khác nhau của những nét văn hóa cổ xưa, tôi mơ ước được sở hữu trong tay chiếc thảm thần để được bay đến Ba Tư nhiều lần hơn nữa. Bởi một lý do rất đơn giản, chiếc vé máy bay và tấm visa để vào Iran đã ngốn một số tiền không nhỏ trong chuyến đi...',       'https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_32905.jpg', '9780000000013', 'VIE', 'Approved', 85),
  (@OwnerId, N'Trở Về Từ Iraq',   N'Đây là cuốn sách thứ ba của tác giả, điểm chung là tính chân thực và sự tinh tế, từ những chi tiết tưởng chừng rất nhỏ trong đời sống mà tác giả phát hiện, chắt lọc và chuyển tải. Mỗi câu chuyện đời sống chân thực là một lát cắt phô ra những thớ, những vân đọng lại trong thân một cội gỗ già. Nó nổi lên và lấp lánh như chứng tích thời gian được hun qua nắng gió, mồ hôi và những trải nghiệm cuộc đời của một người lao động chăm chỉ, thiện lương. Bút ký của Trần Kiêm Hạ hấp dẫn người đọc như khi ta nhìn một vân gỗ, vân đá đẹp, như chén trà Bắc…

Giá trị nhất của tác phẩm này ở chỗ nó kết tinh từ cuộc sống của một con người yêu lao động, yêu quê hương đất nước và trân quý các giá trị truyền thống của gia đình, của quê hương.

Hơn 20 bút ký riêng biệt trong một tập sách không tới 200 trang, đọc xong độc giả sẽ có cảm giác mình vừa gấp lại một bộ tiểu thuyết vậy.',       'https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_56468.jpg', '9780000000014', 'VIE', 'Approved', 85),
  (@OwnerId, N'Nhẹ Bước Lãng Du (Tái Bản 2020)',   N'Cuốn sách tập hợp nhiều bài viết là những liên tưởng thú vị, cảm nhận tinh tế, cảm xúc dạt dào trước vẻ đẹp ở những nơi mà tác giả có dịp đặt chân đến trên bước đường “lãng du” của mình. Đó là Hy Lạp với thánh địa Delphi dìu dặt giữa mộng và thực, đó là Pháp với dòng sông Seine chảy trôi dưới cầu Mirabeau, vũ điệu Flamenco ở Barcelona, đến lăng mộ TJ Mahal nổi tiếng ở Ấn Độ, Hoa Thanh Trì với bức tượng Dương Quý Phi đẹp ngọc ngà, tháp Đại Nhạn ghi dấu công lao dịch kinh Phật của Đường Tam Tạng, hoa anh đào rộ nở trên đất Nhật Bản…

Đó còn là tình cảm sâu sắc, đậm đà với đất nước qua những lần ra Hà Nội viếng Văn Miếu Quốc Tử Giám, qua những dòng sông cây cầu trên khắp mọi miền Tổ quốc… Đọc cuốn sách, ta như được phiêu lưu khắp thế giới, như được tận mắt chứng kiến cũng như có những am hiểu về lịch sử và quá trình hình thành của nhiều danh lam thắng cảnh, hiểu được cuộc đời của các bậc vĩ nhân.

Như lời tác giả tâm sự, “không phải là nhà du khảo, người viết chỉ mong sẻ chia những gì thấy và cảm khi nhẹ bước lãng du”, hy vọng quý độc giả cũng sẽ tìm thấy được sự sẻ chia qua lời văn bình dị, mộc mạc của cuốn sách, cùng tác giả “nhẹ bước lãng du”.',       'https://cdn1.fahasa.com/media/catalog/product/i/m/image_195509_1_39558.jpg', '9780000000042', 'VIE', 'Approved', 85),
  (@OwnerId, N'Collins - Writing For Ielts (Tái Bản 2023)',   N'- Bộ tài liệu được chia thành 10 cuốn bao gồm ngữ pháp, từ vựng, 4 kỹ năng và sách Test. Nội dung mỗi cuốn đều đem lại cho bạn nguồn kiến thức cao để ôn luyện mỗi ngày.

- Ở mỗi cuốn lại được chia thành từng Topic khác nhau theo từng cấp độ nên giúp người học có thể dễ dàng hệ thống cũng như học từ cơ bản tới nâng cao. Các topics liên kết với nhau từ cuốn từ vựng, ngữ pháp đến 4 kỹ năng nên khi học theo bộ, bạn sẽ bám sát và học được nhiều hơn.

- Phân chia các kỹ năng rõ ràng, mỗi bài học có từ kiến thức cơ bản đến bài tập thực hành cho các bạn luyện tập mỗi ngày.

- Ngoài ra, một ưu điểm nữa của bộ sách là trình bày rất dễ xem, có hệ thống và có đầy đủ các dạng test nên dễ dàng học hơn cho mọi người. Các bạn nên chú ý lập kế hoạch học tập để rèn luyện theo từng kỹ năng. Mỗi ngày một kỹ năng hoặc mỗi tiếng một bài học là được rồi...',       'https://cdn1.fahasa.com/media/catalog/product/9/7/9786043778526.jpg', '9780000000043', 'VIE', 'Approved', 85),
  (@OwnerId, N'Tìm Hiểu Thế Giới Cảm Xúc Của Bé Trai',   N'Trong Tìm hiểu thế giới cảm xúc của bé trai, Tiến sĩ Dan Kindlon và Tiến sĩ Michael Thompson, hai trong số những nhà tâm lý học trẻ em hàng đầu của Mĩ, đã chia sẻ những gì họ nghiên cứu hơn 35 năm cùng với kinh nghiệm làm việc với vô vàn các bé trai và gia đình các bé.

Tiến sĩ Michael Thompson đã chia sẻ: Qua cuốn sách, “tôi muốn minh hoạ đời sống nội tâm của các bé trai cho bố mẹ các bé thấy, để từ đó họ sẽ không xa cách con trai mình, không bị tổn thương và buồn rầu trước những thay đổi của con mà không thể hiểu nổi. Tôi muốn chỉ cho cho các bố mẹ cách làm thế nào để phát triển ngôn ngữ cảm xúc phù hợp với con trai mình, một thứ ngôn ngữ sâu sắc và lâu bền – một kênh giao tiếp có thể giúp các bé trai vượt qua được những cuộc đấu tranh dữ dội và tàn nhẫn của tuổi vị thành niên.”',       'https://cdn1.fahasa.com/media/catalog/product/i/m/image_216561.jpg', '9780000000044', 'VIE', 'Approved', 85),
  (@OwnerId, N'Những Từ Ngữ Làm Cho Trẻ Hạnh Phúc',   N'Thông qua 29 tình huống thường thấy trong cuộc sống hàng ngày từ khi trẻ còn là em bé sơ sinh cho đến khi trở thành học sinh trung học phổ thông (Khi trẻ sợ tiêm phòng/Khi trẻ không đánh răng/Khi trẻ hấp tấp/Khi trẻ đánh đổ đồ ăn/Khi trẻ làm nũng lúc mua hàng/Khi trẻ không thể ăn rau,...), tác giả Tanaka Shigeiki đưa ra 29 giải pháp lời nói cụ thể, đầy thuyết phục về một phương pháp nuôi dạy con hoàn toàn thoải mái, nhẹ nhàng. Cha mẹ sẽ thấy nuôi dạy con không hề là áp lực mà là trải nghiệm vui vẻ, là niềm hạnh phúc vô bờ.',       'https://cdn1.fahasa.com/media/catalog/product/n/h/nhung-tu-ngu-lam-cho-tre-hanh-phuc.jpg', '9780000000045', 'VIE', 'Approved', 85),
  (@OwnerId, N'Đọc Sách Cùng Con, Đi Muôn Dặm Đường: Xây Dựng Mối Quan Hệ Ý Nghĩa Và Bền Lâu Với Con',   N'Chắc chắn bạn sẽ không bao giờ hối tiếc khi đọc sách cho con nghe. Bởi nhờ đó, bạn sẽ có thể gắn kết sâu sắc với gia đình mình trong một xã hội bận rộn, tràn ngập công nghệ hiện đại như ngày nay. Và bạn cũng sẽ được thực sự ở bên con, kể cả sau khi con có thể tự đọc. Trong Đọc sách cùng con, đi muôn dặm đường, bạn sẽ tìm thấy niềm cảm hứng thực sự để bắt đầu phong trào đọc sách cùng con ở chính ngôi nhà của mình.

Cuốn sách sẽ giúp bạn khám phá ra cách:

Chuẩn bị cho con hành trang giúp con học tập thành công

Phát triển lòng vị tha và đồng cảm trong con thông qua các cuốn sách

Tìm ra thời gian đọc sách cho con lúc con ở trường, tham gia thể thao và ăn tối.

Chọn sách dựa trên sở thích và độ tuổi khác nhau của các con

Biến việc đọc sách cùng con trở thành khoảng thời gian tuyệt nhất trong ngày của gia đình bạn

Đọc sách cùng con, đi muôn dặm đường cũng cung cấp một danh sách sách phù hợp cho con từ lứa tuổi sơ sinh cho đến vị thành niên. Ngạc nhiên vì những tò mò của tuổi tập đi tới những bướng bỉnh của tuổi mới lớn ở con, bạn sẽ khám phá ra những chiến lược thực tế để biến việc đọc sách cùng con trở thành một “nếp nhà” ý nghĩa. Đọc sách cùng con không chỉ có sức mạnh thay đổi gia đình bạn, mà còn thay đổi cả thế giới',       'https://cdn1.fahasa.com/media/catalog/product/b/i/bia---doc-sach-cung-con-di-muon-dam-duong---bia-1.jpg', '9780000000088', 'VIE', 'Approved', 85),
  (@OwnerId, N'Bản Du Ca Cuối Cùng (Tái Bản)',   N'Chiến tranh đã đẩy biết bao người vào con đường tha hương khi mỗi bến đỗ đều chỉ là tạm bợ cho đến lúc họ bị dồn đuổi đến nơi khác. Kern, một chàng thanh niên Đức, chạy trốn chế độ Quốc xã bạo tàn, lưu lạc đến Áo, bị trục xuất sang Thụy Sĩ, rồi lại tìm đường trốn sang Pháp... Trong cuộc hành trình bất định ấy, anh có duyên gặp gỡ những con người tốt bụng như Steiner, Marill; họ đã cưu mang, giúp đỡ anh trong cuộc sống khó khăn nơi đất khách. Số phận cũng cho anh gặp Ruth – người con gái mang đến cho anh một tình yêu, một niềm an ủi, một hy vọng mới. Họ đến với nhau bằng sự cảm thông sâu sắc giữa hai con người cùng cảnh ngộ. Họ yêu nhau và làm mọi cách để được ở bên nhau bất chấp những lần bị bắt giam, bị trục xuất. Hành trình của họ tựa như bản du ca của những con người không còn đất sống, chỉ có thể bám víu vào con thuyền mang tên hy vọng và tình người.

',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8936203361254.jpg', '9780000000092', 'VIE', 'Approved', 85),
  (@OwnerId, N'Huy Động Vốn: Khó Mà Dễ! (Tái Bản 2018)',   N'Khởi nghiệp là một phần của nền kinh tế hiện nay, nó không đơn giản là một phong trào, xu hướng của thời đại mà còn là lựa chọn, hướng đi của một bộ phận giới trẻ dám dấn thân, dám đón nhận rủi ro và nắm bắt cơ hội để theo đuổi những ý tưởng, những hoài bão nhằm tạo ra giá trị cho bản thân và giá trị cho xã hội.

Alejandro Cremades – tác giả cuốn sách từng nằm trong “Top 30 gương mặt dưới 30 tuổi” của các tạp chí uy tín như Vanity Fair, Entrepreneur, Magazine và GQ Magazine. Ông cũng là nhà sáng lập và điều hành Onevest, hệ sinh thái khởi nghiệp nổi tiếng của Mỹ, chuyên hỗ trợ các sáng lập viên và nhà đầu tư xây dựng doanh nghiệp thành công. Alejandro Cremades đã dẫn dắt tầm nhìn và điều khiển Onevest trong vai trò người đồng sáng lập và chủ tịch điều hành, hỗ trợ các sáng lập viên và nhà đầu tư xây dựng doanh nghiệp thành công.',       'https://cdn1.fahasa.com/media/catalog/product/h/u/huy_dong_von.jpg', '9780000000047', 'VIE', 'Approved', 85),
  (@OwnerId, N'Tư Duy Logic (Tái Bản 2021)',   N'Kanbe – nhân vật chính trong cuốn sách, vào những năm cuối tuổi 20 của cuộc đời, một ngày cô chợt nhận ra, trong khi các bạn cùng trang lứa với cô đã và đang gặt hái nhiều thành quả thì bản thân cô đang dần chững lại trong sự nghiệp. Sau một thời gian suy nghĩ, cô quyết định từ bỏ công việc hiện tại, đi học thêm bằng MBA và đầu quân cho một công ty. Một chương mới tươi sáng hơn được mở ra, và tất cả bắt nguồn từ việc thay đổi nhận thức và tư duy của cô gái trẻ.

- Một số trích dẫn hay trong cuốn “Tư duy Logic”:

1. Điều quan trọng nhất là điểm không mạnh của bạn ở thời điểm hiện tại lại trở thành điều cần thiết sau này.

2. “Người Nhật thường có câu: “Lúc nào anh lại đến chơi nhé!” và thường im lặng khi bị hỏi lại: “Vậy lúc nào thì được?”.

Tôi thường hay bị các bạn người nước ngoài nói như vậy đấy.

Chính những “phép xã giao” như vậy đôi khi cũng khiến chúng ta bị “đơ” ngay tại chỗ. Thế này cũng khá giống với “Big word” nhỉ!

3. Tại sao giả thuyết cần thiết.

Ví dụ tất cả cùng đi săn, mỗi người chỉ có 2 viên đạn. Khi muốn giết một con thú nào đó, bạn có sử dụng đạn bừa bãi không? Hay là phỏng đoán dựa vào âm thanh và hình dáng xem nơi nào có khả năng con thú cần săn đang ở để nhắm bắn? Tất nhiên chúng ta sẽ chọn cách thứ hai đúng không? Bắn mà không xác định được mục tiêu thì chỉ lãng phí đạn mà thôi.

Trong giới kinh doanh, giả thuyết cần thiết vì không thể tùy hứng bắt đầu một lĩnh vực mới mà phó mặc sự thành công cho vận may được. Vậy, lợi ích của việc sử dụng giả thuyết trong kinh doanh là gì?',       'https://cdn1.fahasa.com/media/catalog/product/i/m/image_236462.jpg', '9780000000050', 'VIE', 'Approved', 85),
  (@OwnerId, N'Chữa Lành Những Sang Chấn Tuổi Thơ',   N'Hiểu để phục hồi và chữa lành

Hàng triệu đứa trẻ phải nếm trải sự ngược đãi và bị bỏ rơi 

Mỗi năm trên thế giới có hơn 130 triệu đứa trẻ được sinh ra. Mỗi em lại đến thế giới này cùng những hoàn cảnh xã hội, kinh tế và văn hóa riêng biệt. Một số được chào đón với lòng biết ơn và niềm vui, được nâng niu trong vòng tay cha mẹ, khiến gia đình ngất ngây trong hạnh phúc. Số khác thì bị chối bỏ bởi người mẹ trẻ đang mơ về một cuộc sống khác, bởi cặp vợ chồng bị đói nghèo đè nặng, bởi người cha không biết kiểm soát bản thân và quen thói bạo hành, ...

Những trận đòn đầu đời, những đổ vỡ cảm xúc và sự đứt gãy mối quan hệ với những người thân quan trọng trong thời thơ ấu chắc chắn đã khiến nhiều người hình thành tính độc lập và thu mình lại theo cách cực đoan. Theo ngôn từ mạnh mẽ của bài thơ Invictus (Bất khuất), đó gọi là thuyền trưởng của tâm hồn mình và là chủ nhân của số phận mình.

Và bạn có biết, hàng triệu người đã bị đối xử giống như vậy lúc nhỏ đã lớn lên với niềm tin rằng cuộc đời mình chẳng có giá trị gì. Và khi ai đó phải nếm trải sự ngược đãi và bị sang chấn khi còn nhỏ, não bộ của họ đã tìm được cách để thích nghi.

Chữa lành những sang chấn tuổi thơ - Cuốn sách giúp bạn khám phá phục hồi và trưởng thành sau sang chấn

Tiến sĩ Bruce D. Perry sẽ giải thích trong cuốn sách What Happened To You? | Conversations On Trauma, Resilience, And Healing này, hiểu được cách bộ não phản ứng trước căng thẳng hay sang chấn đầu đời sẽ giúp ta hiểu rõ cách mà những điều đã qua có thể định hình con người ta, cách ta hành xử và lý do vì sao ta lại làm những việc mà ta đang làm.

Qua lăng kính này, ta có thể hình thành một ý thức mới về giá trị bản thân và sau cùng là điều chỉnh lại phản ứng của mình đối với các hoàn cảnh, tình huống và các mối quan hệ. Nói cách khác, đó là bí quyết để ta định hình lại cuộc đời mình.

“Chữa Lành Những Sang Chấn Tuổi Thơ” là cuốn sách giúp bạn khám phá những tác động của mất mát đau thương, ngược đãi, lạm dụng tình dục, phân biệt chủng tộc, kỳ thị nữ giới, bạo lực gia đình, bạo lực cộng đồng, các vấn đề bản dạng giới và tình dục, án oan... để từ đó giúp ta hiểu thêm về sức khỏe, quá trình chữa lành cũng như khả năng phục hồi và trưởng thành sau sang chấn.

Và câu hỏi cơ bản “Điều gì đã xảy ra?” có thể giúp mỗi chúng ta hiểu thêm một chút về cách mà những trải nghiệm – cả tốt lẫn xấu – định hình con người mình. Khi chia sẻ những câu chuyện và khái niệm khoa học này, tác giả hy vọng mỗi người đọc, theo từng cách riêng, sẽ có được những chiêm nghiệm riêng để từ đó có thể sống tốt hơn, trọn vẹn hơn.',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8935278607137.jpg', '9780000000061', 'VIE', 'Approved', 85),
  (@OwnerId, N'Mày Vẫn Ổn, Đừng Lo Lắng! - Một Cuốn Sách Về OCD Bằng Chữ Và Tranh',   N'Mày Vẫn Ổn, Đừng Lo Lắng! - Một Cuốn Sách Về OCD Bằng Chữ Và Tranh

Jason Adam Katzenstein – họa sĩ vẽ tranh cho Tạp chí New Yorker cố gắng sống một cuộc đời bình thường nhưng lại liên tục bị bộ não hay lo lắng thái quá quấy nhiễu. Những việc đơn giản như bắt tay hay dùng chung một ly nước với anh cũng trở thành thảm họa. Jason mắc chứng rối loạn ám ảnh cưỡng chế (OCD) – một căn bệnh tinh thần buộc anh liên tục thực hiện các “nghi thức” như kiểm tra, rửa tay và rửa sạch đồ vật để bảo vệ mình khỏi những nguy hiểm không tồn tại.

Anh cố hết sức che giấu chứng ám ảnh đáng xấu hổ này, đôi lúc cũng hiệu quả. Rồi anh bắt đầu lo lắng về nụ hôn đầu đời, say mê công việc vẽ tranh hoạt hình. Suốt thời gian đó, một nửa năng lượng trong anh dành để sống cuộc sống bình thường, nửa còn lại “tận hiến” với những “nghi thức” ngày càng lố bịch mà chính anh đã duy trì để giữ bản thân an ổn.

Thế rồi, an ổn cũng mất.

Rơi vào tình trạng tồi tề nhất, Jason quyết định làm điều anh luôn được khuyên nhủ: tham vấn trị liệu và dùng thuốc. Chúng từng khiến anh hoảng sợ, và vẫn tiếp tục làm anh phát khiếp, nhưng chính chúng cũng lại giúp anh hồi phục.

Mày Vẫn Ổn, Đừng Lo Lắng! là cuốn tiểu thuyết hình ảnh về những câu chuyện tự hại Jason kể với chính mình, lặp đi lặp lại, cho tới khi chúng bắt đầu trở thành sự thật. Trong những bức tranh siêu thực, dí dỏm và đầy tính giãi bày này, Jason đã chứng minh OCD vẫn rất hài hước dù nhìn bề ngoài nó đang dần dần hủy hoại cuộc đời anh.

Mày Vẫn Ổn, Đừng Lo Lắng! chân thành, cần thiết, đã hé lộ sự phức tạp trong não bộ con người, đồng thời cho thấy cách mà sức sáng tạo và tình bạn đã neo giữ chúng ta. Bạn không cần phải mắc OCD mới yêu thích cuốn sách này đâu. Bạn có thể tận hưởng niềm vui, sự u tối và sự thật trong đó. Đây là một cuốn sách phải-đọc dành cho những ai đang phân vân liệu mình có nhìn thế giới hơi khác mọi người không.',       'https://cdn1.fahasa.com/media/catalog/product/b/_/b_a-1-m_y-v_n-_n-_ng-lo-l_ng-600.jpg', '9780000000064', 'EN', 'Approved', 85),
  (@OwnerId, N'No Bad Parts - Không Có Phần Nào Xấu',   N'Có phải chỉ có một “bạn”?

Chúng ta vẫn tin rằng mình chỉ có một bản dạng duy nhất và cảm thấy sợ hãi hoặc xấu hổ khi không thể kiểm soát được những tiếng nói bên trong không phù hợp với hình mẫu lý tưởng mà ta nghĩ mình nên trở thành.

Tuy nhiên, nghiên cứu của Tiến sĩ Richard Schwartz đang thách thức lý thuyết “tâm trí đơn nguyên” này. Ông cho rằng: “Tất cả chúng ta đều được sinh ra với nhiều phần tâm trí phụ. Những phần này không phải là tưởng tượng hay mang tính biểu tượng. Chúng là những cá nhân tồn tại như một gia đình nội tâm trong chúng ta, và chìa khóa để khỏe mạnh và hạnh phúc là tôn trọng, thấu hiểu và yêu thương mọi phần trong con người bạn.”

Với No Bad Parts, tác giả Richard Schwartz giới thiệu liệu pháp Hệ thống gia đình nội tâm (IFS) và lý giải tại sao nó lại có hiệu quả đến vậy trong các lĩnh vực như phục hồi sau sang chấn, trị liệu chứng nghiện và điều trị trầm cảm – và những hiểu biết mới mẻ về ý thức này có thể sẽ thay đổi hoàn toàn cuộc sống của chúng ta.

Trong cuốn sách này, bạn sẽ khám phá:

- Cuộc cách mạng IFS - việc tôn trọng và giao tiếp với các phần thay đổi cách tiếp cận sức khỏe tinh thần của chúng ta như thế nào

- Đảo ngược các giả định về văn hóa, khoa học và tinh thần vốn củng cố mô hình tâm trí đơn nguyên lỗi thời

- Cái tôi, kẻ chỉ trích nội tâm, kẻ phá hoại - biến những phần ác ý này thành những đồng minh hùng mạnh

- Gánh nặng - tại sao các phần của chúng ta trở nên méo mó và mắc kẹt trong những tổn thương thời thơ ấu và niềm tin văn hóa

- Cách IFS thể hiện tính nhân văn của con người bằng cách tiết lộ rằng không có phần nào xấu

- Bản ngã - khám phá bản chất tốt đẹp, giàu lòng trắc ẩn, khôn ngoan của bạn, đó là nguồn gốc của sự chữa lành và hòa hợp

- Các bài tập để lập bản đồ các phần của bạn, tiếp cận Bản ngã, làm việc với nhà bảo vệ đầy thách thức, xác định các yếu tố kích hoạt của từng phần, v.v..',       'https://cdn1.fahasa.com/media/catalog/product/n/o/no-bad-parts_khong-co-phan-nao-xau--bia-1.jpg', '9780000000059', 'VIE', 'Approved', 85),
  (@OwnerId, N'Tại Sao Chúng Ta Luôn Cảm Thấy Mình Không Đủ Tốt?',   N'Trên con đường trưởng thành, ta hay tự kìm nén cảm xúc trong lòng và cho rằng đó là một hành động khôn ngoan. Nhưng, thực tế là bạn đã bắt đầu trượt dài vào “vũng lầy” phủ định bản thân, luôn chỉ sợ mất lòng người khác mà sau cùng lại đánh mất bản ngã của mình. 

Từ quan điểm tâm lý học, chúng ta luôn cảm thấy mình không đủ tốt không phải vì chúng ta thực sự xấu, mà là do sự thiên lệch trong nhận thức về bản thân, khiến ta luôn thấy mình không xứng đáng.

Với 9 câu chuyện có thật được kể lại qua giọng văn ấm áp của tác giả, từng khía cạnh tâm lý bất-thường-một-cách-bình-thường được hé mở, những cảm xúc chân thật không còn cần phải giấu giếm, những áp lực vô hình được phơi bày… Sự rắc rối trong tâm lý không chỉ được phản ánh qua các nhân vật chính, mà ngay cả những nhân vật khác khi xuất hiện, có lẽ bạn cũng sẽ nhìn thấy hình bóng bản thân trong đó.

Từng phân tích tuần tự, phương pháp hợp lý và sự chân thành của tác giả muốn gửi gắm đến chúng ta rằng: Thay vì chỉ biết dựa vào những so sánh khập khiễng, hãy học cách đối diện với cảm xúc tiêu cực, dám BỊ GHÉT, dám phá vỡ khuôn khổ do người khác đặt ra, dám làm trái những quy tắc khiến chúng ta đau khổ và dám TRÂN TRỌNG BẢN THÂN MÌNH TRƯỚC NHẤT.

Chỉ cần đừng buông bỏ chính mình, trong màn sương mù giăng lối, ta vẫn sẽ tìm được đường hướng tới Mặt trời. ',       'hhttps://cdn1.fahasa.com/media/catalog/product/b/_/b_a1_t_i-sao-ch_ng-ta-lu_n-c_m-th_y-m_nh-kh_ng-_-t_t.jpg', '9780000000080', 'VIE', 'Approved', 85),
  (@OwnerId, N'Học Thương Mình Giữa Muôn Vàn Vụn Vỡ - 1/5 Giây Để Rung Động Với Chính Mình',   N'Dành tặng bạn, người tự ti với nỗi lo không đủ tốt

Cuốn sách tổng hợp 60 bài học chăm sóc sức khỏe tinh thần, giúp bạn thêm tin yêu bản thân

Cùng bạn đi qua những vụn vỡ để tìm thấy dáng vẻ rực rỡ nhất của chính mình

—

NẾU CẦN 1/5 GIÂY ĐỂ RUNG ĐỘNG VỚI MỘT NGƯỜI, TÔI SẼ CHỌN CHÍNH MÌNH!

“Chúng ta chỉ mất 1/5 giây để phải lòng 1 người. Người ta thường gọi đó là tình yêu sét đánh. Vậy tại sao chúng ta không thể dễ dàng yêu thương bản thân như cách chúng ta dễ dàng yêu một ai khác? Tại sao yêu thương bản thân lại cần nhiều điều kiện đến vậy? Sao ta không thể dành 1/5 giây để rung động với chính mình?”

Bởi thế giới của người lớn là thế giới của định kiến, của quy chuẩn về đạo đức, giới tính, của những “nhãn mác” về thành công, hạnh phúc, của những tình yêu thương có điều kiện... Chúng ta đã lớn lên trong thế giới ấy với một trái tim đầy sợ hãi và nghi hoặc về chính mình. Những “vết thương”, những va vấp trên hành trình học cách trưởng thành khiến chúng ta dần tự ti, sợ rằng mình không đủ tốt, dần khép mình và chối bỏ những cảm xúc sâu thẳm bên trong. Thật ra, dù chúng ta có phớt lờ những gì mình cảm thấy mỗi khi tan vỡ, “đứa trẻ bên trong” ta vẫn luôn “thắt” lại, nhắc nhở rằng “đứa trẻ” ấy cũng cần được yêu thương và chữa lành.

Thông qua 60 câu chuyện và bài tập thực hành nâng cao sức khỏe tinh thần trong cuốn sách “1/5 giây để rung động với chính mình?” - tác giả, thạc sĩ giáo dục Thanh Alice muốn nhắn nhủ tới bạn rằng:

- Nếu bạn quá bận tâm đến sự đánh giá, ghi nhận, yêu thương của người khác… thì bạn không hề đơn độc đâu. Bởi nỗi sợ “không đủ tốt” là bản năng của loài người, nhưng không phải không thể vượt qua!

- Chạm vào những tổn thương từ lâu không dám đối diện là điều ai cũng phải trải qua để sống thật với chính mình, để biết cách ôm lấy bản thân và có một nội tâm vững vàng.

Cuốn sách “1/5 giây để rung động với chính mình - Học thương mình giữa muôn vàn vụn vỡ” sẽ cổ vũ bạn yêu thương bản thân để trở thành phiên bản rực rỡ và trọn vẹn.',       'https://cdn1.fahasa.com/media/catalog/product/b/_/b_a_45.jpg', '9780000000040', 'VIE', 'Approved', 85),
  (@OwnerId, N'Khi Mọi Điều Không Như Ý',   N'KHI MỌI ĐIỀU KHÔNG NHƯ Ý - LIỆU BÌNH YÊN CÓ TỒN TẠI GIỮA GIÔNG BÃO?

Có những ngày, mọi thứ đều chống lại ta - công việc bế tắc, các mối quan hệ rạn nứt, lòng trống rỗng đến nghẹt thở. Ta tự hỏi: "Bao giờ mọi thứ mới ổn?" Nhưng liệu bình yên có đến từ việc thay đổi hoàn cảnh, hay từ cách ta nhìn nhận nó? Hae Min không cho ta một lối thoát thần kỳ, mà là những lời thì thầm ấm áp, giúp ta chậm lại, thấu hiểu chính mình và tìm thấy sự nhẹ nhõm ngay cả khi mọi điều không như ý.',       'https://cdn1.fahasa.com/media/catalog/product/8/9/8935235243163.jpg', '9780000000081', 'VIE', 'Approved', 85),
  (@OwnerId, N'C# for Beginners',   N'Introductory C# programming.',       'https://m.media-amazon.com/images/I/71KX3DYaCiL._UF894,1000_QL80_.jpg', '97800000000113', 'VIE', 'Approved', 85);
END


DECLARE @Book1Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'The Art of Reading');
DECLARE @Book2Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'C# for Beginners');

-- Declare thêm id cho các sách đã insert ở trên (phục vụ tham chiếu về sau)
DECLARE @Book_MienBac INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Miền Bắc - Một Thời Chiến Tranh Một Thời Hòa Bình');
DECLARE @Book_DiaTrungHai INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Lịch Sử Các Nước Ven Địa Trung Hải - Bìa Cứng');
DECLARE @Book_BaiGiangAnNam INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Bài Giảng Lịch Sử An Nam');
DECLARE @Book_TamLyToiPham INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tâm Lý Học Tội Phạm Vén Màn Bí Mật Biểu Cảm');
DECLARE @Book_NhatKy1111 INT = (SELECT BookId FROM dbo.Books WHERE Title=N'1111 - Nhật Ký Sáu Vạn Dặm Trên Yên Xe Cà Tàng');
DECLARE @Book_TrenDuongVeNhoDay INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Trên Đường Về Nhớ Đầy');
DECLARE @Book_CoHenVoiParis INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Có Hẹn Với Paris');
DECLARE @Book_CoDonTrenEverest INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Cô Đơn Trên Everest');
DECLARE @Book_VangSonBaTu INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Vàng Son Một Thuở Ba Tư (Tập Du Ký)');
DECLARE @Book_TroVeTuIraq INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Trở Về Từ Iraq');
DECLARE @Book_NheBuocLangDu INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Nhẹ Bước Lãng Du (Tái Bản 2020)');
DECLARE @Book_CollinsIELTS INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Collins - Writing For Ielts (Tái Bản 2023)');
DECLARE @Book_CamXucBeTrai INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tìm Hiểu Thế Giới Cảm Xúc Của Bé Trai');
DECLARE @Book_NhungTuNguHanhPhuc INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Những Từ Ngữ Làm Cho Trẻ Hạnh Phúc');
DECLARE @Book_DocSachCungCon INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Đọc Sách Cùng Con, Đi Muôn Dặm Đường: Xây Dựng Mối Quan Hệ Ý Nghĩa Và Bền Lâu Với Con');
DECLARE @Book_BanDuCaCuoiCung INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Bản Du Ca Cuối Cùng (Tái Bản)');
DECLARE @Book_HuyDongVon INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Huy Động Vốn: Khó Mà Dễ! (Tái Bản 2018)');
DECLARE @Book_TuDuyLogic INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tư Duy Logic (Tái Bản 2021)');
DECLARE @Book_ChuaLanhSangChan INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Chữa Lành Những Sang Chấn Tuổi Thơ');
DECLARE @Book_MayVanOn INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Mày Vẫn Ổn, Đừng Lo Lắng! - Một Cuốn Sách Về OCD Bằng Chữ Và Tranh');
DECLARE @Book_NoBadParts INT = (SELECT BookId FROM dbo.Books WHERE Title=N'No Bad Parts - Không Có Phần Nào Xấu');
DECLARE @Book_KhongDuTot INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tại Sao Chúng Ta Luôn Cảm Thấy Mình Không Đủ Tốt?');
DECLARE @Book_HocThuongMinh INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Học Thương Mình Giữa Muôn Vàn Vụn Vỡ - 1/5 Giây Để Rung Động Với Chính Mình');
DECLARE @Book_KhiMoiDieuKhongNhuY INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Khi Mọi Điều Không Như Ý');

-- Map categories (guard null)
IF @Book1Id IS NOT NULL
  INSERT INTO dbo.BookCategories(BookId, CategoryId)
  SELECT @Book1Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre')
  WHERE NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@Book1Id AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre'));
IF @Book2Id IS NOT NULL
  INSERT INTO dbo.BookCategories(BookId, CategoryId)
  SELECT @Book2Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Programming' AND Type='Subject')
  WHERE NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@Book2Id AND CategoryId=(SELECT CategoryId FROM dbo.Categories WHERE Name=N'Programming' AND Type='Subject'));

-- Chapters (guard null)
IF @Book1Id IS NOT NULL
BEGIN
  INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
  VALUES
    (@Book1Id, N'Why Read',             50, 'https://cdn/vb/b1/ch1.pdf', 12, 'https://cdn/vb/b1/ch1.mp3', 600, 12),
    (@Book1Id, N'Building a Habit',     40, 'https://cdn/vb/b1/ch2.pdf', 10, 'https://cdn/vb/b1/ch2.mp3', 540, 12),
    (@Book1Id, N'Choosing Books',       30, 'https://cdn/vb/b1/ch3.pdf', 11, 'https://cdn/vb/b1/ch3.mp3', 570, 12);
END
IF @Book2Id IS NOT NULL
BEGIN
  INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
  VALUES
    (@Book2Id, N'Hello C#',             45, 'https://cdn/vb/b2/ch1.pdf', 14, 'https://cdn/vb/b2/ch1.mp3', 660, 15),
    (@Book2Id, N'Variables & Types',    40, 'https://cdn/vb/b2/ch2.pdf', 16, 'https://cdn/vb/b2/ch2.mp3', 780, 15);
END

DECLARE @B1C1 INT = (SELECT TOP 1 ChapterId FROM dbo.Chapters WHERE BookId=@Book1Id ORDER BY ChapterId);
DECLARE @B2C1 INT = (SELECT TOP 1 ChapterId FROM dbo.Chapters WHERE BookId=@Book2Id ORDER BY ChapterId);

-- Staff approves (guard null)
IF @Book1Id IS NOT NULL
  INSERT INTO dbo.BookApprovals(BookId, StaffId, Action, Reason)
  VALUES (@Book1Id, @StaffId, 'Approve', NULL);
IF @Book2Id IS NOT NULL
  INSERT INTO dbo.BookApprovals(BookId, StaffId, Action, Reason)
  VALUES (@Book2Id, @StaffId, 'Approve', NULL);



/* =========================================================
   Promotions
   ========================================================= */
INSERT INTO dbo.Promotions(OwnerId, PromotionName, Description, DiscountType, DiscountValue, Quantity, StartAt, EndAt, IsActive)
VALUES (@OwnerId, N'Back to School', N'20% off selected programming chapters', 'Percent', 20.00, 100,
        DATEADD(DAY,-3,SYSUTCDATETIME()), DATEADD(DAY,30,SYSUTCDATETIME()), 1);

IF @Book2Id IS NOT NULL
  INSERT INTO dbo.PromotionApplications(PromotionId, BookId)
  SELECT TOP 1 PromotionId, @Book2Id FROM dbo.Promotions ORDER BY PromotionId DESC;



/* =========================================================
   Ví dụ dữ liệu demo cho WalletTransactions / OrderItems / PaymentRequests
   ========================================================= */

-- 1. Alice nạp xu qua VNPay (Succeeded)
INSERT INTO dbo.WalletTransactions(UserId, Provider, TransactionId, AmountMoney, AmountCoin, Status, CreatedAt)
VALUES
  (@AliceId, 'VNPay', 'TXN-A-0001', 20000, 20000, 'Succeeded', SYSUTCDATETIME());

-- 2. Alice dùng xu để mua 2 chương (guard null)
IF @B1C1 IS NOT NULL
  INSERT INTO dbo.OrderItems(CustomerId, ChapterId, UnitPrice, CashSpent, PaidAt, OrderType)
  VALUES (@AliceId, @B1C1, 12000, 12000, SYSUTCDATETIME(), 'BuyChapter');
IF @B2C1 IS NOT NULL
  INSERT INTO dbo.OrderItems(CustomerId, ChapterId, UnitPrice, CashSpent, PaidAt, OrderType)
  VALUES (@AliceId, @B2C1, 15000, 15000, SYSUTCDATETIME(), 'BuyChapter');

-- 3. Chủ sách (Owner) yêu cầu rút xu
INSERT INTO dbo.PaymentRequests(UserId, RequestedCoin, Status, RequestDate, AcceptDate)
VALUES
  (@OwnerId, 100000, 'Pending', SYSUTCDATETIME(), NULL),
  (@OwnerId,  50000, 'Succeeded', DATEADD(DAY,-1,SYSUTCDATETIME()), SYSUTCDATETIME());




/* =========================================================
   User Interactions
   ========================================================= */
-- Wishlists (guard null)
IF @Book1Id IS NOT NULL
  INSERT INTO dbo.Wishlists(UserId, BookId) VALUES (@AliceId, @Book1Id);
IF @Book2Id IS NOT NULL
  INSERT INTO dbo.Wishlists(UserId, BookId) VALUES (@BobId, @Book2Id);

-- Bookmarks (guard null)
IF @Book1Id IS NOT NULL AND @B1C1 IS NOT NULL
  INSERT INTO dbo.Bookmarks(UserId, BookId, ChapterReadId, PagePosition, AudioPosition)
  VALUES (@AliceId, @Book1Id, @B1C1, 5, NULL);

-- Reviews (guard null)
IF @Book1Id IS NOT NULL
  INSERT INTO dbo.BookReviews(BookId, UserId, Rating, Comment)
  VALUES (@Book1Id, @AliceId, 5, N'Rất hữu ích để xây thói quen đọc!');

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


/* =========================================================
   Thêm sách & chapters demo (có audio và không audio)
   ========================================================= */

-- Thêm 4 sách mới
INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView)
VALUES
  (@OwnerId, N'Learning SQL', N'Practical guide to SQL database queries.', 
   'https://m.media-amazon.com/images/I/81xkjj+FAfL._UF1000,1000_QL80_.jpg', '9780000000035', 'EN', 'Approved', 60),
  (@OwnerId, N'Tiếng Việt Thực Hành', N'Bài tập và ví dụ tiếng Việt.', 
   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpPc3nRmkLl5drpPIsG0j48orbJooj8ZpfrA&s', '97800000000422', 'VN', 'Approved', 40),
  (@OwnerId, N'The Power of Habit', N'Classic guide to building good habits.', 
   'https://0.academia-photos.com/attachment_thumbnails/42458634/mini_magick20190217-29727-3ejvf5.png?1550449652', '97800000000590', 'EN', 'Approved', 150),
  (@OwnerId, N'Mindfulness Everyday', N'Practical exercises for daily mindfulness.', 
   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkLK8veL1SrE-55ozEKV3659bhvFze7nt0Gw&s', '9780000000066', 'EN', 'Approved', 95);

DECLARE @Book3Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Learning SQL');
DECLARE @Book4Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tiếng Việt Thực Hành');
DECLARE @Book5Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'The Power of Habit');
DECLARE @Book6Id INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Mindfulness Everyday');

-- Map category cho sách
INSERT INTO dbo.BookCategories(BookId, CategoryId)
VALUES
  (@Book3Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Technology' AND Type='Subject')),
  (@Book4Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Fiction' AND Type='Genre')),
  (@Book5Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre')),
  (@Book6Id, (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre'));

-- Chapters cho "Learning SQL" (có audio)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
VALUES
  (@Book3Id, N'Introduction to SQL', 20, 'https://cdn/vb/b3/ch1.pdf', 18, 'https://cdn/vb/b3/ch1.mp3', 800, 20),
  (@Book3Id, N'Joins and Queries',   15, 'https://cdn/vb/b3/ch2.pdf', 22, 'https://cdn/vb/b3/ch2.mp3', 900, 22);

-- Chapters cho "Tiếng Việt Thực Hành" (không audio)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
VALUES
  (@Book4Id, N'Chính tả và Ngữ pháp', 25, 'https://cdn/vb/b4/ch1.pdf', 30, NULL, NULL, NULL),
  (@Book4Id, N'Từ vựng nâng cao',     18, 'https://cdn/vb/b4/ch2.pdf', 28, NULL, NULL, NULL);

-- Chapters cho "The Power of Habit" (có audio)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
VALUES
  (@Book5Id, N'Keystone Habits', 60, 'https://cdn/vb/b5/ch1.pdf', 20, 'https://cdn/vb/b5/ch1.mp3', 1000, 25),
  (@Book5Id, N'Small Wins',      45, 'https://cdn/vb/b5/ch2.pdf', 18, 'https://cdn/vb/b5/ch2.mp3', 880, 22);

-- Chapters cho "Mindfulness Everyday" (không audio)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
VALUES
  (@Book6Id, N'Breathing Awareness', 40, 'https://cdn/vb/b6/ch1.pdf', 15, NULL, NULL, NULL),
  (@Book6Id, N'Walking Meditation',  35, 'https://cdn/vb/b6/ch2.pdf', 16, NULL, NULL, NULL);


-- Notifications
INSERT INTO dbo.Notifications(UserId, Type, Title, Body)
VALUES
  (@OwnerId, 'Order',   N'Đơn hàng mới', N'Alice vừa mua chương mới.'),
  (@AliceId, 'System',  N'Chào mừng',     N'Cảm ơn bạn đã đăng ký VieBook!');



/* =========================================================
   Reading
   ========================================================= */
IF @Book1Id IS NOT NULL
BEGIN
  INSERT INTO dbo.ReadingSchedules(UserId, BookId, BeginReadAt, ReadingTime, IsActive)
  VALUES
    (@AliceId, @Book1Id, DATEADD(HOUR,2,SYSUTCDATETIME()), 30, 1);
END



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

IF @Book1Id IS NOT NULL
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

IF @Book1Id IS NOT NULL
BEGIN
  INSERT INTO dbo.BookOffers(PostId, OwnerId, BookId, AccessType, Quantity, Criteria, Status)
  VALUES
    (@GiftPost, @OwnerId, @Book1Id, 'Audio', 5, N'Random 5 bạn comment sớm nhất', 'Active');
END

DECLARE @OfferId BIGINT = (SELECT BookOfferId FROM dbo.BookOffers WHERE PostId=@GiftPost);

IF @OfferId IS NOT NULL
BEGIN
  INSERT INTO dbo.BookClaims(BookOfferId, CustomerId, Note, Status)
  VALUES
    (@OfferId, @AliceId, N'Em muốn nghe thử ạ!', 'Pending'),
    (@OfferId, @BobId,   N'Cho mình xin 1 suất nhé!', 'Pending');
END



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

-- Idempotent: only add if missing
IF COL_LENGTH('dbo.Books','Author') IS NULL
BEGIN
  ALTER TABLE dbo.Books ADD Author NVARCHAR(255) NULL;
END
GO
-- Insert thêm data for users
INSERT INTO [dbo].[Users] (Email, PasswordHash, Status, CreatedAt, Wallet)
VALUES (
    'huonggntt14@gmail.com',
    HASHBYTES('SHA2_256', '123456'),  
    'Active',
    GETDATE(),
    0
);

/* =========================================================
   Backfill dựa trên dữ liệu Books hiện có
   ========================================================= */
-- 1) Tạo category mặc định nếu thiếu
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name=N'Sách Thiên Văn' AND Type='Genre')
BEGIN
  INSERT INTO dbo.Categories(Name, Type, ParentId, IsActive)
  VALUES (N'Sách Thiên Văn', 'Genre', NULL, 1);
END

DECLARE @DefaultCatId INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Sách Thiên Văn' AND Type='Genre');

-- 2) Gán category mặc định cho bất kỳ sách nào chưa có map trong BookCategories
INSERT INTO dbo.BookCategories(BookId, CategoryId)
SELECT b.BookId, @DefaultCatId
FROM dbo.Books b
LEFT JOIN dbo.BookCategories bc ON bc.BookId = b.BookId
WHERE bc.BookId IS NULL;

-- 3) Thêm 2 chương mặc định cho sách chưa có chapter
;WITH BooksWithoutChapters AS (
  SELECT b.BookId
  FROM dbo.Books b
  LEFT JOIN dbo.Chapters c ON c.BookId = b.BookId
  GROUP BY b.BookId
  HAVING COUNT(c.ChapterId) = 0
)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
SELECT bwc.BookId, N'Chương 1', 0,
       CONCAT('https://cdn/vb/b', bwc.BookId, '/ch1.pdf'), 10,
       CONCAT('https://cdn/vb/b', bwc.BookId, '/ch1.mp3'), 600, 10
FROM BooksWithoutChapters bwc
UNION ALL
SELECT bwc.BookId, N'Chương 2', 0,
       CONCAT('https://cdn/vb/b', bwc.BookId, '/ch2.pdf'), 12,
       CONCAT('https://cdn/vb/b', bwc.BookId, '/ch2.mp3'), 660, 12
FROM BooksWithoutChapters bwc;

/* =========================================================
   Map category và thêm 2 chapters mẫu cho các sách đã DECLARE
   (Idempotent: chỉ chèn nếu chưa có)
   ========================================================= */
-- Re-declare book ids for this section scope
DECLARE @Book_MienBac INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Miền Bắc - Một Thời Chiến Tranh Một Thời Hòa Bình');
DECLARE @Book_DiaTrungHai INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Lịch Sử Các Nước Ven Địa Trung Hải - Bìa Cứng');
DECLARE @Book_BaiGiangAnNam INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Bài Giảng Lịch Sử An Nam');
DECLARE @Book_TamLyToiPham INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tâm Lý Học Tội Phạm Vén Màn Bí Mật Biểu Cảm');
DECLARE @Book_NhatKy1111 INT = (SELECT BookId FROM dbo.Books WHERE Title=N'1111 - Nhật Ký Sáu Vạn Dặm Trên Yên Xe Cà Tàng');
DECLARE @Book_TrenDuongVeNhoDay INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Trên Đường Về Nhớ Đầy');
DECLARE @Book_CoHenVoiParis INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Có Hẹn Với Paris');
DECLARE @Book_CoDonTrenEverest INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Cô Đơn Trên Everest');
DECLARE @Book_VangSonBaTu INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Vàng Son Một Thuở Ba Tư (Tập Du Ký)');
DECLARE @Book_TroVeTuIraq INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Trở Về Từ Iraq');
DECLARE @Book_NheBuocLangDu INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Nhẹ Bước Lãng Du (Tái Bản 2020)');
DECLARE @Book_CollinsIELTS INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Collins - Writing For Ielts (Tái Bản 2023)');
DECLARE @Book_CamXucBeTrai INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tìm Hiểu Thế Giới Cảm Xúc Của Bé Trai');
DECLARE @Book_NhungTuNguHanhPhuc INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Những Từ Ngữ Làm Cho Trẻ Hạnh Phúc');
DECLARE @Book_DocSachCungCon INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Đọc Sách Cùng Con, Đi Muôn Dặm Đường: Xây Dựng Mối Quan Hệ Ý Nghĩa Và Bền Lâu Với Con');
DECLARE @Book_BanDuCaCuoiCung INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Bản Du Ca Cuối Cùng (Tái Bản)');
DECLARE @Book_HuyDongVon INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Huy Động Vốn: Khó Mà Dễ! (Tái Bản 2018)');
DECLARE @Book_TuDuyLogic INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tư Duy Logic (Tái Bản 2021)');
DECLARE @Book_ChuaLanhSangChan INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Chữa Lành Những Sang Chấn Tuổi Thơ');
DECLARE @Book_MayVanOn INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Mày Vẫn Ổn, Đừng Lo Lắng! - Một Cuốn Sách Về OCD Bằng Chữ Và Tranh');
DECLARE @Book_NoBadParts INT = (SELECT BookId FROM dbo.Books WHERE Title=N'No Bad Parts - Không Có Phần Nào Xấu');
DECLARE @Book_KhongDuTot INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Tại Sao Chúng Ta Luôn Cảm Thấy Mình Không Đủ Tốt?');
DECLARE @Book_HocThuongMinh INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Học Thương Mình Giữa Muôn Vàn Vụn Vỡ - 1/5 Giây Để Rung Động Với Chính Mình');
DECLARE @Book_KhiMoiDieuKhongNhuY INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Khi Mọi Điều Không Như Ý');
DECLARE @CatSelfHelp INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Self-Help' AND Type='Genre');
DECLARE @CatHistory2 INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Lịch sử' AND Type='Genre');
DECLARE @CatLiterature2 INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Văn học' AND Type='Genre');

-- Helper: map + two chapters
-- Miền Bắc - Một Thời Chiến Tranh Một Thời Hòa Bình -> Lịch sử
IF @Book_MienBac IS NOT NULL
BEGIN
  IF @CatHistory2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@Book_MienBac AND CategoryId=@CatHistory2)
    INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@Book_MienBac, @CatHistory2);
  IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@Book_MienBac)
  BEGIN
    INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
    VALUES
      (@Book_MienBac, N'Chương 1', 0, CONCAT('https://cdn/vb/b', @Book_MienBac, '/ch1.pdf'), 16, CONCAT('https://cdn/vb/b', @Book_MienBac, '/ch1.mp3'), 900, 12),
      (@Book_MienBac, N'Chương 2', 0, CONCAT('https://cdn/vb/b', @Book_MienBac, '/ch2.pdf'), 14, CONCAT('https://cdn/vb/b', @Book_MienBac, '/ch2.mp3'), 840, 12);
  END
END

-- Lịch Sử Các Nước Ven Địa Trung Hải - Bìa Cứng -> Lịch sử
IF @Book_DiaTrungHai IS NOT NULL
BEGIN
  IF @CatHistory2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@Book_DiaTrungHai AND CategoryId=@CatHistory2)
    INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@Book_DiaTrungHai, @CatHistory2);
  IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@Book_DiaTrungHai)
  BEGIN
    INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
    VALUES
      (@Book_DiaTrungHai, N'Chương 1', 0, CONCAT('https://cdn/vb/b', @Book_DiaTrungHai, '/ch1.pdf'), 20, CONCAT('https://cdn/vb/b', @Book_DiaTrungHai, '/ch1.mp3'), 1000, 15),
      (@Book_DiaTrungHai, N'Chương 2', 0, CONCAT('https://cdn/vb/b', @Book_DiaTrungHai, '/ch2.pdf'), 18, CONCAT('https://cdn/vb/b', @Book_DiaTrungHai, '/ch2.mp3'), 920, 15);
  END
END

-- Bài Giảng Lịch Sử An Nam -> Lịch sử
IF @Book_BaiGiangAnNam IS NOT NULL
BEGIN
  IF @CatHistory2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@Book_BaiGiangAnNam AND CategoryId=@CatHistory2)
    INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@Book_BaiGiangAnNam, @CatHistory2);
  IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@Book_BaiGiangAnNam)
  BEGIN
    INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
    VALUES
      (@Book_BaiGiangAnNam, N'Chương 1', 0, CONCAT('https://cdn/vb/b', @Book_BaiGiangAnNam, '/ch1.pdf'), 16, CONCAT('https://cdn/vb/b', @Book_BaiGiangAnNam, '/ch1.mp3'), 860, 12),
      (@Book_BaiGiangAnNam, N'Chương 2', 0, CONCAT('https://cdn/vb/b', @Book_BaiGiangAnNam, '/ch2.pdf'), 14, CONCAT('https://cdn/vb/b', @Book_BaiGiangAnNam, '/ch2.mp3'), 780, 12);
  END
END

-- Nhóm Self-Help
DECLARE @BooksSelfHelp TABLE(BookId INT);
INSERT INTO @BooksSelfHelp(BookId)
SELECT v FROM (VALUES
  (@Book_TamLyToiPham),(@Book_CollinsIELTS),(@Book_CamXucBeTrai),(@Book_NhungTuNguHanhPhuc),
  (@Book_DocSachCungCon),(@Book_HuyDongVon),(@Book_TuDuyLogic),(@Book_ChuaLanhSangChan),
  (@Book_MayVanOn),(@Book_NoBadParts),(@Book_KhongDuTot),(@Book_HocThuongMinh),(@Book_KhiMoiDieuKhongNhuY)
) AS s(v)
WHERE v IS NOT NULL;

-- Map Self-Help
IF @CatSelfHelp IS NOT NULL
BEGIN
  INSERT INTO dbo.BookCategories(BookId, CategoryId)
  SELECT b.BookId, @CatSelfHelp
  FROM @BooksSelfHelp b
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.BookCategories bc WHERE bc.BookId=b.BookId AND bc.CategoryId=@CatSelfHelp
  );
END

-- Chapters cho nhóm Self-Help (nếu chưa có)
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
SELECT b.BookId, N'Chương 1', 0, CONCAT('https://cdn/vb/b', b.BookId, '/ch1.pdf'), 12, NULL, NULL, NULL
FROM @BooksSelfHelp b
WHERE NOT EXISTS (SELECT 1 FROM dbo.Chapters c WHERE c.BookId=b.BookId)
UNION ALL
SELECT b.BookId, N'Chương 2', 0, CONCAT('https://cdn/vb/b', b.BookId, '/ch2.pdf'), 12, NULL, NULL, NULL
FROM @BooksSelfHelp b
WHERE NOT EXISTS (SELECT 1 FROM dbo.Chapters c WHERE c.BookId=b.BookId);

-- Nhóm Văn học / Du ký
DECLARE @BooksLiterature TABLE(BookId INT);
INSERT INTO @BooksLiterature(BookId)
SELECT v FROM (VALUES
  (@Book_NhatKy1111),(@Book_TrenDuongVeNhoDay),(@Book_CoHenVoiParis),(@Book_CoDonTrenEverest),
  (@Book_VangSonBaTu),(@Book_TroVeTuIraq),(@Book_NheBuocLangDu),(@Book_BanDuCaCuoiCung)
) AS s(v)
WHERE v IS NOT NULL;

-- Map Văn học
IF @CatLiterature2 IS NOT NULL
BEGIN
  INSERT INTO dbo.BookCategories(BookId, CategoryId)
  SELECT b.BookId, @CatLiterature2
  FROM @BooksLiterature b
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.BookCategories bc WHERE bc.BookId=b.BookId AND bc.CategoryId=@CatLiterature2
  );
END

-- Chapters cho nhóm Văn học (không audio) nếu chưa có
INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
SELECT b.BookId, N'Chương 1', 0, CONCAT('https://cdn/vb/b', b.BookId, '/ch1.pdf'), 14, NULL, NULL, NULL
FROM @BooksLiterature b
WHERE NOT EXISTS (SELECT 1 FROM dbo.Chapters c WHERE c.BookId=b.BookId)
UNION ALL
SELECT b.BookId, N'Chương 2', 0, CONCAT('https://cdn/vb/b', b.BookId, '/ch2.pdf'), 16, NULL, NULL, NULL
FROM @BooksLiterature b
WHERE NOT EXISTS (SELECT 1 FROM dbo.Chapters c WHERE c.BookId=b.BookId);

/* =========================================================
   Seed thêm: 3 sách ở trang chủ (HomeManager) + category + chapters
   ========================================================= */
-- Đảm bảo category tồn tại
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name=N'Khoa Học' AND Type='Genre')
BEGIN
  INSERT INTO dbo.Categories(Name, Type, ParentId, IsActive)
  VALUES (N'Khoa Học', 'Genre', NULL, 1);
END
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name=N'Lịch sử' AND Type='Genre')
BEGIN
  INSERT INTO dbo.Categories(Name, Type, ParentId, IsActive)
  VALUES (N'Lịch sử', 'Genre', NULL, 1);
END
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name=N'Văn học' AND Type='Genre')
BEGIN
  INSERT INTO dbo.Categories(Name, Type, ParentId, IsActive)
  VALUES (N'Văn học', 'Genre', NULL, 1);
END

DECLARE @CatAudio INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Khoa Học' AND Type='Genre');
DECLARE @CatHistory INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Lịch sử' AND Type='Genre');
DECLARE @CatLiterature INT = (SELECT CategoryId FROM dbo.Categories WHERE Name=N'Văn học' AND Type='Genre');

-- Đảm bảo cột Author tồn tại trước khi insert các sách có Author
IF COL_LENGTH('dbo.Books','Author') IS NULL
BEGIN
  ALTER TABLE dbo.Books ADD Author NVARCHAR(255) NULL;
END

-- Re-declare OwnerId for this section scope
DECLARE @OwnerId INT = (SELECT UserId FROM dbo.Users WHERE Email='owner@viebook.local');

-- Thêm 3 sách minh họa từ HomeManager (nếu chưa tồn tại)
IF NOT EXISTS (SELECT 1 FROM dbo.Books WHERE Title=N'Cặp Đôi Hoàn Cảnh')
BEGIN
  INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView, Author)
  VALUES
    (@OwnerId, N'Cặp Đôi Hoàn Cảnh', N'Sách nói minh họa hiển thị trên trang chủ.',
     'https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/674/webp_4619250472f4de917b13d976c5f699daaa9f80b0.webp',
     '9780000099001', 'VIE', 'Approved', 10, N'Tác giả 1');
END
IF NOT EXISTS (SELECT 1 FROM dbo.Books WHERE Title=N'Sử Ký III - Thế Gia')
BEGIN
  INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView, Author)
  VALUES
    (@OwnerId, N'Sử Ký III - Thế Gia', N'Sách lịch sử hiển thị trên trang chủ.',
     'https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/427775/webp_2487324742bb2e88.webp',
     '9780000099002', 'VIE', 'Approved', 10, N'Tác giả 2');
END
IF NOT EXISTS (SELECT 1 FROM dbo.Books WHERE Title=N'Truyện Ngắn Thạch Lam 1')
BEGIN
  INSERT INTO dbo.Books(OwnerId, Title, Description, CoverUrl, ISBN, Language, Status, TotalView, Author)
  VALUES
    (@OwnerId, N'Truyện Ngắn Thạch Lam 1', N'Tuyển tập truyện ngắn văn học Việt Nam.',
     'https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/1935/webp_791488618ba8b70aa2082505031c3e1f922eba1d.webp',
     '9780000099003', 'VIE', 'Approved', 10, N'Thạch Lam');
END

DECLARE @BHS1 INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Cặp Đôi Hoàn Cảnh');
DECLARE @BHS2 INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Sử Ký III - Thế Gia');
DECLARE @BHS3 INT = (SELECT BookId FROM dbo.Books WHERE Title=N'Truyện Ngắn Thạch Lam 1');

-- Map categories (idempotent)
IF NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@BHS1 AND CategoryId=@CatAudio)
  INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@BHS1, @CatAudio);
IF NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@BHS2 AND CategoryId=@CatHistory)
  INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@BHS2, @CatHistory);
IF NOT EXISTS (SELECT 1 FROM dbo.BookCategories WHERE BookId=@BHS3 AND CategoryId=@CatLiterature)
  INSERT INTO dbo.BookCategories(BookId, CategoryId) VALUES (@BHS3, @CatLiterature);

-- Thêm chapters mẫu cho mỗi sách nếu chưa có
IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@BHS1)
BEGIN
  INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
  VALUES
    (@BHS1, N'Chương 1: Gặp gỡ', 5, 'https://cdn/vb/hm1/ch1.pdf', 12, 'https://cdn/vb/hm1/ch1.mp3', 600, 10),
    (@BHS1, N'Chương 2: Hoàn cảnh', 3, 'https://cdn/vb/hm1/ch2.pdf', 10, 'https://cdn/vb/hm1/ch2.mp3', 540, 10);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@BHS2)
BEGIN
  INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
  VALUES
    (@BHS2, N'Chương 1: Thế gia mở đầu', 5, 'https://cdn/vb/hm2/ch1.pdf', 18, 'https://cdn/vb/hm2/ch1.mp3', 900, 12),
    (@BHS2, N'Chương 2: Sự kiện tiêu biểu', 4, 'https://cdn/vb/hm2/ch2.pdf', 16, 'https://cdn/vb/hm2/ch2.mp3', 840, 12);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Chapters WHERE BookId=@BHS3)
BEGIN
  INSERT INTO dbo.Chapters(BookId, ChapterTitle, ChapterView, ChapterSoftUrl, TotalPage, ChapterAudioUrl, DurationSec, PriceAudio)
  VALUES
    (@BHS3, N'Chương 1: Hai đứa trẻ', 6, 'https://cdn/vb/hm3/ch1.pdf', 14, NULL, NULL, NULL),
    (@BHS3, N'Chương 2: Dưới bóng hoàng lan', 4, 'https://cdn/vb/hm3/ch2.pdf', 12, NULL, NULL, NULL);
END
