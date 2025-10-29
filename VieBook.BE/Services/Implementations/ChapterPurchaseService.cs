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
        private readonly IChapterRepository _chapterRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly INotificationService _notificationService;
        private readonly DataAccess.VieBookContext _context;

        public ChapterPurchaseService(
            IUserRepository userRepository,
            IBookRepository bookRepository,
            IChapterRepository chapterRepository,
            IOrderItemRepository orderItemRepository,
            INotificationService notificationService,
            DataAccess.VieBookContext context)
        {
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _chapterRepository = chapterRepository;
            _orderItemRepository = orderItemRepository;
            _notificationService = notificationService;
            _context = context;
        }

        public async Task<ChapterPurchaseResponseDTO> PurchaseChaptersAsync(int userId, ChapterPurchaseRequestDTO request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. VALIDATE USER & WALLET
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                // 2. VALIDATE BOOK & OWNERSHIP
                var book = await _bookRepository.GetByIdAsync(request.BookId);
                if (book == null)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Book not found"
                    };
                }

                // Kiểm tra user có phải là owner của sách không (không thể mua sách của mình)
                if (book.OwnerId == userId)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "You cannot purchase chapters from your own book"
                    };
                }

                // 3. GET CHAPTERS INFO
                var chapters = await _bookRepository.GetChaptersByBookIdAsync(request.BookId);
                var chaptersToPurchase = chapters.Where(c => request.ChapterIds.Contains(c.ChapterId)).ToList();

                if (chaptersToPurchase.Count != request.ChapterIds.Count)
                {
                    var foundChapterIds = chaptersToPurchase.Select(c => c.ChapterId).ToList();
                    var missingChapterIds = request.ChapterIds.Except(foundChapterIds).ToList();

                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = $"Some chapters not found or inactive. Missing chapter IDs: {string.Join(", ", missingChapterIds)}"
                    };
                }

                // 4. CHECK EXISTING PURCHASES
                var existingPurchases = await _orderItemRepository.GetUserPurchasedChaptersAsync(userId);
                var alreadyPurchasedChapterIds = existingPurchases
                    .Select(p => p.ChapterId)
                    .ToList();
                var newChaptersToPurchase = chaptersToPurchase
                    .Where(c => !alreadyPurchasedChapterIds.Contains(c.ChapterId))
                    .ToList();

                if (newChaptersToPurchase.Count == 0)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "All selected chapters have already been purchased"
                    };
                }

                // 5. VALIDATE PURCHASE TYPE
                if (request.PurchaseType != "soft" && request.PurchaseType != "audio" && request.PurchaseType != "both")
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Invalid PurchaseType. Must be 'soft', 'audio', or 'both'"
                    };
                }

                // 6. GET AUDIO PRICES (if needed)
                Dictionary<int, decimal> audioPrices = new Dictionary<int, decimal>();
                if (request.PurchaseType == "audio" || request.PurchaseType == "both")
                {
                    audioPrices = await _bookRepository.GetChapterAudioPricesAsync(request.BookId);
                }

                // 7. CALCULATE TOTAL COST
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

                // 8. VALIDATE TOTAL COST
                if (totalCost <= 0)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Total cost must be greater than 0. Some chapters may have invalid prices."
                    };
                }

                // 9. VALIDATE WALLET BALANCE
                if (user.Wallet < totalCost)
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Insufficient wallet balance"
                    };
                }

                // 10. CREATE ORDER ITEMS
                var orderItemsToCreate = new List<OrderItem>();

                foreach (var chapter in newChaptersToPurchase)
                {
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
                        orderItemsToCreate.Add(softOrderItem);

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
                            orderItemsToCreate.Add(audioOrderItem);
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

                        orderItemsToCreate.Add(orderItem);
                    }
                }

                // 11. SAVE ORDER ITEMS (bulk insert)
                await _orderItemRepository.CreateOrderItemsAsync(orderItemsToCreate);

                // 12. BUILD RESPONSE DTOs
                var purchasedItems = await _orderItemRepository.GetUserPurchasedChaptersAsync(userId);
                var latestPurchases = purchasedItems
                    .Where(p => request.ChapterIds.Contains(p.ChapterId))
                    .ToList();

                // 13. UPDATE WALLETS
                // Trừ xu từ ví người mua
                await _userRepository.UpdateWalletBalanceAsync(userId, -totalCost);

                // Cộng tiền vào ví của owner (người sở hữu sách)
                await _userRepository.UpdateWalletBalanceAsync(book.OwnerId, totalCost);

                // 14. SEND NOTIFICATIONS
                // Tạo thông báo cho owner về doanh thu
                await _notificationService.CreateAsync(new CreateNotificationDTO
                {
                    UserId = book.OwnerId,
                    Title = "Bạn có doanh thu mới",
                    Body = $"Bạn nhận được {totalCost} xu từ việc bán {newChaptersToPurchase.Count} chương của sách '{book.Title}'",
                    Type = "WALLET_RECHARGE"
                });

                // Tạo thông báo cho người mua
                await _notificationService.CreateChapterPurchaseNotificationAsync(
                    userId,
                    request.BookId,
                    newChaptersToPurchase.Count,
                    totalCost,
                    request.PurchaseType
                );

                // 15. GET REMAINING BALANCE
                var updatedUser = await _userRepository.GetByIdAsync(userId);
                var remainingBalance = updatedUser?.Wallet ?? 0;

                // 16. COMMIT TRANSACTION
                await transaction.CommitAsync();

                // 17. BUILD SUCCESS RESPONSE
                string purchaseTypeMessage = request.PurchaseType switch
                {
                    "soft" => $"{latestPurchases.Count} bản mềm",
                    "audio" => $"{latestPurchases.Count} bản audio",
                    "both" => $"{newChaptersToPurchase.Count} chương (cả bản mềm và audio với giảm giá 10%)",
                    _ => $"{latestPurchases.Count} chương"
                };

                return new ChapterPurchaseResponseDTO
                {
                    Success = true,
                    Message = $"Successfully purchased {purchaseTypeMessage}",
                    TotalCost = totalCost,
                    RemainingBalance = remainingBalance,
                    PurchasedItems = latestPurchases
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
            return await _orderItemRepository.CheckChapterOwnershipAsync(userId, chapterId);
        }

        public async Task<bool> CheckChapterSoftOwnershipAsync(int userId, int chapterId)
        {
            return await _orderItemRepository.CheckChapterSoftOwnershipAsync(userId, chapterId);
        }

        public async Task<bool> CheckChapterAudioOwnershipAsync(int userId, int chapterId)
        {
            return await _orderItemRepository.CheckChapterAudioOwnershipAsync(userId, chapterId);
        }

        public async Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId)
        {
            return await _orderItemRepository.GetUserPurchasedChaptersAsync(userId);
        }

        public async Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId)
        {
            return await _orderItemRepository.GetUserPurchasedBooksAsync(userId);
        }
    }
}
