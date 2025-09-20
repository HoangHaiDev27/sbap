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
                var alreadyPurchasedChapterIds = existingPurchases.Select(p => p.ChapterId).ToList();
                var newChaptersToPurchase = chaptersToPurchase.Where(c => !alreadyPurchasedChapterIds.Contains(c.ChapterId)).ToList();

                if (newChaptersToPurchase.Count == 0)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "All selected chapters have already been purchased"
                    };
                }

                var totalCost = newChaptersToPurchase.Sum(c => c.PriceAudio ?? 0);

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

                    var orderItem = new OrderItem
                    {
                        CustomerId = userId,
                        ChapterId = chapter.ChapterId,
                        UnitPrice = chapter.PriceAudio ?? 0,
                        CashSpent = chapter.PriceAudio ?? 0,
                        PaidAt = DateTime.UtcNow,
                        OrderType = "BuyChapter"
                    };

                    _context.OrderItems.Add(orderItem);
                }

                // Lưu tất cả OrderItems cùng lúc
                await _context.SaveChangesAsync();

                // Tạo DTOs sau khi lưu thành công
                foreach (var chapter in newChaptersToPurchase)
                {
                    var orderItem = _context.OrderItems
                        .FirstOrDefault(oi => oi.CustomerId == userId && oi.ChapterId == chapter.ChapterId);

                    if (orderItem != null)
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

                // Trừ xu từ ví
                await _userRepository.UpdateWalletBalanceAsync(userId, -totalCost);

                // Tạo thông báo
                await _notificationService.CreateChapterPurchaseNotificationAsync(
                    userId,
                    request.BookId,
                    newChaptersToPurchase.Count,
                    totalCost
                );

                await transaction.CommitAsync();

                return new ChapterPurchaseResponseDTO
                {
                    Success = true,
                    Message = $"Successfully purchased {newChaptersToPurchase.Count} chapters",
                    TotalCost = totalCost,
                    RemainingBalance = user.Wallet - totalCost,
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
            var existingPurchase = await _context.OrderItems
                .FirstOrDefaultAsync(oi => oi.CustomerId == userId && oi.ChapterId == chapterId);

            return existingPurchase != null;
        }

        public async Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId)
        {
            var purchasedItems = await _context.OrderItems
                .Where(oi => oi.CustomerId == userId)
                .Include(oi => oi.Chapter)
                .Select(oi => new OrderItemDTO
                {
                    OrderItemId = oi.OrderItemId,
                    ChapterId = oi.ChapterId,
                    ChapterTitle = oi.Chapter.ChapterTitle,
                    UnitPrice = oi.UnitPrice,
                    CashSpent = oi.CashSpent,
                    PaidAt = oi.PaidAt ?? DateTime.UtcNow,
                    OrderType = oi.OrderType ?? "BuyChapter"
                })
                .ToListAsync();

            return purchasedItems ?? new List<OrderItemDTO>();
        }
    }
}
