using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Services.Implementations
{
    public class ChapterPurchaseService : IChapterPurchaseService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBookRepository _bookRepository;
        private readonly INotificationService _notificationService;
        private readonly DataAccess.VieBookContext _context;

        public ChapterPurchaseService(
            IUserRepository userRepository,
            IBookRepository bookRepository,
            INotificationService notificationService,
            DataAccess.VieBookContext context)
        {
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _notificationService = notificationService;
            _context = context;
        }

        public async Task<ChapterPurchaseResponseDTO> PurchaseChaptersAsync(int userId, ChapterPurchaseRequestDTO request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Lấy thông tin user và kiểm tra số dư
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                // Kiểm tra user có tồn tại trong database không
                var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
                if (!userExists)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "User not found in database"
                    };
                }

                // Kiểm tra xem user có phải là owner của sách không
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.BookId == request.BookId);

                if (book == null)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Book not found"
                    };
                }

                if (book.OwnerId == userId)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "You cannot purchase chapters from your own book"
                    };
                }

                // Lấy thông tin các chapter và tính tổng giá
                var chapters = await _bookRepository.GetChaptersByBookIdAsync(request.BookId);
                var chaptersToPurchase = chapters.Where(c => request.ChapterIds.Contains(c.ChapterId)).ToList();

                if (chaptersToPurchase.Count != request.ChapterIds.Count)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Some chapters not found"
                    };
                }

                // Kiểm tra xem user đã mua chapter nào chưa
                var existingPurchases = await GetUserPurchasedChaptersAsync(userId);
                var alreadyPurchasedChapterIds = existingPurchases
                    .Select(p => p.ChapterId)
                    .ToList();
                var newChaptersToPurchase = chaptersToPurchase.Where(c => !alreadyPurchasedChapterIds.Contains(c.ChapterId)).ToList();

                if (newChaptersToPurchase.Count == 0)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "All selected chapters have already been purchased"
                    };
                }

                // Kiểm tra PurchaseType hợp lệ
                if (request.PurchaseType != "soft" && request.PurchaseType != "audio" && request.PurchaseType != "both")
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Invalid PurchaseType. Must be 'soft', 'audio', or 'both'"
                    };
                }

                // Lấy giá audio cho cả 2 trường hợp "audio" và "both"
                Dictionary<int, decimal> audioPrices = new Dictionary<int, decimal>();
                if (request.PurchaseType == "audio" || request.PurchaseType == "both")
                {
                    audioPrices = await _bookRepository.GetChapterAudioPricesAsync(request.BookId);
                }

                // Tính tổng giá dựa trên loại mua
                decimal totalCost = 0;
                if (request.PurchaseType == "soft")
                {
                    // Giá bản mềm từ PriceAudio trong Chapters
                    totalCost = newChaptersToPurchase.Sum(c => c.PriceAudio ?? 0);
                }
                else if (request.PurchaseType == "audio")
                {
                    // Giá audio từ PriceAudio trong ChapterAudios
                    totalCost = newChaptersToPurchase.Sum(c =>
                        audioPrices.ContainsKey(c.ChapterId) ? audioPrices[c.ChapterId] : (c.PriceAudio ?? 0)
                    );
                }
                else if (request.PurchaseType == "both")
                {
                    // Giá cả 2 loại với giảm 10%
                    foreach (var chapter in newChaptersToPurchase)
                    {
                        decimal softPrice = chapter.PriceAudio ?? 0;
                        decimal audioPrice = audioPrices.ContainsKey(chapter.ChapterId) ? audioPrices[chapter.ChapterId] : 0;
                        decimal bothPrice = softPrice + audioPrice;
                        decimal discountedPrice = bothPrice * 0.9m; // Giảm 10%
                        totalCost += discountedPrice;
                    }
                }

                // Kiểm tra totalCost > 0
                if (totalCost <= 0)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Total cost must be greater than 0. Some chapters may have invalid prices."
                    };
                }

                // Kiểm tra số dư
                if (user.Wallet < totalCost)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Insufficient wallet balance"
                    };
                }

                // Tạo OrderItem cho từng chapter
                var purchasedItems = new List<OrderItemDTO>();
                foreach (var chapter in newChaptersToPurchase)
                {
                    // Kiểm tra chapter tồn tại
                    var chapterExists = await _context.Chapters
                        .AnyAsync(c => c.ChapterId == chapter.ChapterId);

                    if (!chapterExists)
                    {
                        return new ChapterPurchaseResponseDTO
                        {
                            Success = false,
                            Message = $"Chapter {chapter.ChapterId} not found"
                        };
                    }

                    if (request.PurchaseType == "both")
                    {
                        // Trường hợp mua cả 2: tạo 2 OrderItem riêng (soft và audio) với giá sau giảm
                        decimal softPrice = chapter.PriceAudio ?? 0;
                        decimal audioPrice = audioPrices.ContainsKey(chapter.ChapterId) ? audioPrices[chapter.ChapterId] : 0;
                        decimal totalBoth = softPrice + audioPrice;
                        decimal discount = totalBoth * 0.1m; // Giảm 10%

                        // Giá sau giảm cho mỗi loại (chia theo tỷ lệ)
                        decimal totalAfterDiscount = totalBoth - discount;
                        decimal softDiscounted = softPrice > 0 ? (softPrice / totalBoth) * totalAfterDiscount : 0;
                        decimal audioDiscounted = audioPrice > 0 ? (audioPrice / totalBoth) * totalAfterDiscount : 0;

                        // Tạo OrderItem cho bản mềm
                        var softOrderItem = new OrderItem
                        {
                            CustomerId = userId,
                            ChapterId = chapter.ChapterId,
                            UnitPrice = softPrice,
                            CashSpent = softDiscounted,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterSoft"
                        };
                        _context.OrderItems.Add(softOrderItem);

                        // Tạo OrderItem cho bản audio (nếu có giá)
                        if (audioPrice > 0)
                        {
                            var audioOrderItem = new OrderItem
                            {
                                CustomerId = userId,
                                ChapterId = chapter.ChapterId,
                                UnitPrice = audioPrice,
                                CashSpent = audioDiscounted,
                                PaidAt = DateTime.UtcNow,
                                OrderType = "BuyChapterAudio"
                            };
                            _context.OrderItems.Add(audioOrderItem);
                        }
                    }
                    else
                    {
                        // Trường hợp mua riêng lẻ (soft hoặc audio)
                        decimal unitPrice = 0;
                        if (request.PurchaseType == "soft")
                        {
                            unitPrice = chapter.PriceAudio ?? 0;
                        }
                        else if (request.PurchaseType == "audio")
                        {
                            unitPrice = audioPrices.ContainsKey(chapter.ChapterId)
                                ? audioPrices[chapter.ChapterId]
                                : (chapter.PriceAudio ?? 0);
                        }

                        var orderItem = new OrderItem
                        {
                            CustomerId = userId,
                            ChapterId = chapter.ChapterId,
                            UnitPrice = unitPrice,
                            CashSpent = unitPrice,
                            PaidAt = DateTime.UtcNow,
                            OrderType = request.PurchaseType == "soft" ? "BuyChapterSoft" : "BuyChapterAudio"
                        };

                        _context.OrderItems.Add(orderItem);
                    }
                }

                // Lưu tất cả OrderItems cùng lúc
                await _context.SaveChangesAsync();

                // Tạo DTOs sau khi lưu thành công
                foreach (var chapter in newChaptersToPurchase)
                {
                    // Lấy tất cả OrderItems cho chapter này (có thể có 2 nếu mua cả soft và audio)
                    var orderItems = await _context.OrderItems
                        .Where(oi => oi.CustomerId == userId &&
                                    oi.ChapterId == chapter.ChapterId &&
                                    oi.PaidAt.HasValue)
                        .OrderByDescending(oi => oi.PaidAt)
                        .ToListAsync();

                    // Thêm tất cả OrderItems vào danh sách
                    foreach (var orderItem in orderItems)
                    {
                        purchasedItems.Add(new OrderItemDTO
                        {
                            OrderItemId = orderItem.OrderItemId,
                            ChapterId = chapter.ChapterId,
                            ChapterTitle = chapter.ChapterTitle,
                            UnitPrice = orderItem.UnitPrice,
                            CashSpent = orderItem.CashSpent,
                            PaidAt = orderItem.PaidAt ?? DateTime.UtcNow,
                            OrderType = orderItem.OrderType ?? "BuyChapter"
                        });
                    }
                }

                // Trừ xu từ ví người mua
                await _userRepository.UpdateWalletBalanceAsync(userId, -totalCost);

                // Cộng tiền vào ví của owner (người sở hữu sách)
                // Không cần kiểm tra book.OwnerId != userId vì đã kiểm tra ở trên
                await _userRepository.UpdateWalletBalanceAsync(book.OwnerId, totalCost);

                // Tạo thông báo cho owner về doanh thu
                await _notificationService.CreateAsync(new CreateNotificationDTO
                {
                    UserId = book.OwnerId,
                    Title = "Bạn có doanh thu mới",
                    Body = $"Bạn nhận được {totalCost} xu từ việc bán {newChaptersToPurchase.Count} chương của sách '{book.Title}'",
                    Type = "WALLET_RECHARGE"
                });

                // Lấy số dư mới sau khi cập nhật
                var updatedUser = await _userRepository.GetByIdAsync(userId);
                var remainingBalance = updatedUser?.Wallet ?? 0;

                // Tạo thông báo cho người mua
                await _notificationService.CreateChapterPurchaseNotificationAsync(
                    userId,
                    request.BookId,
                    newChaptersToPurchase.Count,
                    totalCost,
                    request.PurchaseType
                );

                await transaction.CommitAsync();

                // Tạo message chi tiết dựa trên PurchaseType
                string purchaseTypeMessage = request.PurchaseType switch
                {
                    "soft" => $"{purchasedItems.Count} bản mềm",
                    "audio" => $"{purchasedItems.Count} bản audio",
                    "both" => $"{newChaptersToPurchase.Count} chương (cả bản mềm và audio với giảm giá 10%)",
                    _ => $"{purchasedItems.Count} chương"
                };

                return new ChapterPurchaseResponseDTO
                {
                    Success = true,
                    Message = $"Successfully purchased {purchaseTypeMessage}",
                    TotalCost = totalCost,
                    RemainingBalance = remainingBalance,
                    PurchasedItems = purchasedItems
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                // Log chi tiết lỗi
                Console.WriteLine($"Error purchasing chapters: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                return new ChapterPurchaseResponseDTO
                {
                    Success = false,
                    Message = $"Error purchasing chapters: {ex.InnerException?.Message ?? ex.Message}"
                };
            }
        }

        public async Task<bool> CheckChapterOwnershipAsync(int userId, int chapterId)
        {
            // Kiểm tra xem user có mua chapter này không (bất kỳ loại nào: soft, audio, hoặc both)
            // Nếu mua soft hoặc both → có thể đọc bản mềm
            // Nếu mua audio hoặc both → có thể nghe bản audio
            var existingPurchase = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.CustomerId == userId &&
                                         oi.ChapterId == chapterId &&
                                         oi.PaidAt != null);

            return existingPurchase != null;
        }

        // Method bổ sung: Kiểm tra quyền đọc bản mềm (soft hoặc both)
        public async Task<bool> CheckChapterSoftOwnershipAsync(int userId, int chapterId)
        {
            var existingPurchase = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.CustomerId == userId &&
                                         oi.ChapterId == chapterId &&
                                         oi.PaidAt != null &&
                                         (oi.OrderType == "BuyChapterSoft" || oi.OrderType == "BuyChapterBoth"));

            return existingPurchase != null;
        }

        // Method bổ sung: Kiểm tra quyền nghe bản audio (audio hoặc both)
        public async Task<bool> CheckChapterAudioOwnershipAsync(int userId, int chapterId)
        {
            var existingPurchase = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.CustomerId == userId &&
                                         oi.ChapterId == chapterId &&
                                         oi.PaidAt != null &&
                                         (oi.OrderType == "BuyChapterAudio" || oi.OrderType == "BuyChapterBoth"));

            return existingPurchase != null;
        }

        public async Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId)
        {
            var purchasedItems = await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .Select(oi => new OrderItemDTO
                {
                    OrderItemId = oi.OrderItemId,
                    ChapterId = oi.ChapterId,
                    ChapterTitle = oi.Chapter.ChapterTitle,
                    BookId = oi.Chapter.BookId,
                    UnitPrice = oi.UnitPrice,
                    CashSpent = oi.CashSpent,
                    PaidAt = oi.PaidAt ?? DateTime.UtcNow,
                    OrderType = oi.OrderType ?? "BuyChapter"
                })
                .ToListAsync();

            return purchasedItems ?? new List<OrderItemDTO>();
        }

        public async Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId)
        {
            // Lấy tất cả sách mà user đã mua ít nhất 1 chapter
            var purchasedBooks = await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Include(oi => oi.Chapter)
                    .ThenInclude(c => c.Book)
                .GroupBy(oi => oi.Chapter.BookId)
                .Select(g => new UserPurchasedBooksDTO
                {
                    BookId = g.Key,
                    Title = g.First().Chapter.Book.Title,
                    Description = g.First().Chapter.Book.Description,
                    CoverUrl = g.First().Chapter.Book.CoverUrl,
                    Author = g.First().Chapter.Book.Author,
                    PurchasedChaptersCount = g.Count(),
                    TotalSpent = g.Sum(oi => oi.CashSpent),
                    LastPurchasedAt = g.Max(oi => oi.PaidAt!.Value),
                    TotalChaptersCount = _context.Chapters.Count(c => c.BookId == g.Key && c.Status == "Active")
                })
                .ToListAsync();

            return purchasedBooks ?? new List<UserPurchasedBooksDTO>();
        }
    }
}
