using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Transactions;

namespace Services.Implementations
{
    public class ChapterPurchaseService : IChapterPurchaseService
    {
        private readonly IUserRepository _userRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IChapterRepository _chapterRepository;
        private readonly IOrderItemRepository _orderItemRepository;
        private readonly INotificationService _notificationService;

        public ChapterPurchaseService(
            IUserRepository userRepository,
            IBookRepository bookRepository,
            IChapterRepository chapterRepository,
            IOrderItemRepository orderItemRepository,
            INotificationService notificationService)
        {
            _userRepository = userRepository;
            _bookRepository = bookRepository;
            _chapterRepository = chapterRepository;
            _orderItemRepository = orderItemRepository;
            _notificationService = notificationService;
        }

        public async Task<ChapterPurchaseResponseDTO> PurchaseChaptersAsync(int userId, ChapterPurchaseRequestDTO request)
        {
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
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

                // Kiểm tra sách có đang ở trạng thái InActive không (không cho mua)
                if (book.Status == "InActive")
                {
                    return new ChapterPurchaseResponseDTO
                    {
                        Success = false,
                        Message = "Sách đang tạm dừng, không thể mua chương"
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

                // 4. CHECK EXISTING PURCHASES (phân biệt theo OrderType)
                var existingPurchases = await _orderItemRepository.GetUserPurchasedChaptersAsync(userId);

                // Xác định OrderType cần check dựa trên PurchaseType
                List<string> orderTypesToCheck = new List<string>();
                if (request.PurchaseType == "soft")
                {
                    orderTypesToCheck.Add("BuyChapterSoft");
                    orderTypesToCheck.Add("BuyChapter"); // Legacy order type
                }
                else if (request.PurchaseType == "audio")
                {
                    orderTypesToCheck.Add("BuyChapterAudio");
                }
                else if (request.PurchaseType == "both")
                {
                    // Nếu mua "both", cần check xem đã có cả soft và audio chưa
                    orderTypesToCheck.Add("BuyChapterSoft");
                    orderTypesToCheck.Add("BuyChapter");
                    orderTypesToCheck.Add("BuyChapterAudio");
                }

                // Lọc các chapter đã mua theo OrderType tương ứng
                var alreadyPurchasedByType = existingPurchases
                    .Where(p => orderTypesToCheck.Contains(p.OrderType))
                    .Select(p => p.ChapterId)
                    .ToList();

                // Nếu mua "both", cần check xem đã có cả soft VÀ audio chưa
                List<Chapter> newChaptersToPurchase;
                if (request.PurchaseType == "both")
                {
                    // Lấy các chapter đã mua cả soft và audio
                    var chaptersWithBoth = existingPurchases
                        .Where(p => p.OrderType == "BuyChapterSoft" || p.OrderType == "BuyChapter")
                        .Select(p => p.ChapterId)
                        .Intersect(
                            existingPurchases
                                .Where(p => p.OrderType == "BuyChapterAudio")
                                .Select(p => p.ChapterId)
                        )
                        .ToList();

                    // Chỉ lọc bỏ các chapter đã mua CẢ HAI
                    newChaptersToPurchase = chaptersToPurchase
                        .Where(c => !chaptersWithBoth.Contains(c.ChapterId))
                        .ToList();
                }
                else
                {
                    // Với soft hoặc audio, chỉ check OrderType tương ứng
                    newChaptersToPurchase = chaptersToPurchase
                        .Where(c => !alreadyPurchasedByType.Contains(c.ChapterId))
                        .ToList();
                }

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
                    // Lấy giá audio qua Repository để tuân thủ cấu trúc DAO-Repository-Service
                    var allAudioPrices = await _bookRepository.GetChapterAudioPricesAsync(request.BookId);
                    audioPrices = allAudioPrices
                        .Where(kv => request.ChapterIds.Contains(kv.Key))
                        .ToDictionary(kv => kv.Key, kv => kv.Value);
                }

                // 6.5. GET ACTIVE PROMOTION FOR BOOK
                var promotion = await _bookRepository.GetActivePromotionForBook(request.BookId);
                decimal? promotionPercent = null;
                if (promotion != null && promotion.DiscountType == "Percent")
                {
                    promotionPercent = promotion.DiscountValue;
                }

                // 7. CALCULATE TOTAL COST (với promotion nếu có)
                decimal totalCost = 0;
                if (request.PurchaseType == "soft")
                {
                    // Giá bản mềm từ PriceSoft trong Chapters
                    decimal baseTotal = newChaptersToPurchase.Sum(c => c.PriceSoft ?? 0);
                    // Áp dụng promotion nếu có
                    if (promotionPercent.HasValue)
                    {
                        totalCost = baseTotal * (1 - promotionPercent.Value / 100);
                    }
                    else
                    {
                        totalCost = baseTotal;
                    }
                }
                else if (request.PurchaseType == "audio")
                {
                    // Giá audio từ PriceAudio trong ChapterAudios
                    decimal baseTotal = newChaptersToPurchase.Sum(c =>
                        audioPrices.ContainsKey(c.ChapterId) ? audioPrices[c.ChapterId] : 0
                    );
                    // Áp dụng promotion nếu có
                    if (promotionPercent.HasValue)
                    {
                        totalCost = baseTotal * (1 - promotionPercent.Value / 100);
                    }
                    else
                    {
                        totalCost = baseTotal;
                    }
                }
                else if (request.PurchaseType == "both")
                {
                    // Giá cả 2 loại với giảm 10% combo, sau đó áp dụng promotion nếu có
                    decimal comboTotal = 0;
                    foreach (var chapter in newChaptersToPurchase)
                    {
                        decimal softPrice = chapter.PriceSoft ?? 0;
                        decimal audioPrice = audioPrices.ContainsKey(chapter.ChapterId) ? audioPrices[chapter.ChapterId] : 0;
                        decimal bothPrice = softPrice + audioPrice;
                        decimal comboDiscountPrice = bothPrice * 0.9m; // Giảm 10% combo
                        comboTotal += comboDiscountPrice;
                    }
                    // Áp dụng promotion nếu có
                    if (promotionPercent.HasValue)
                    {
                        totalCost = comboTotal * (1 - promotionPercent.Value / 100);
                    }
                    else
                    {
                        totalCost = comboTotal;
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

                // 10. CREATE ORDER ITEMS (với promotion nếu có)
                var orderItemsToCreate = new List<OrderItem>();

                foreach (var chapter in newChaptersToPurchase)
                {
                    if (request.PurchaseType == "both")
                    {
                        // Trường hợp mua cả 2: tạo 2 OrderItem riêng (soft và audio)
                        decimal softPrice = chapter.PriceSoft ?? 0;
                        decimal audioPrice = audioPrices.ContainsKey(chapter.ChapterId) ? audioPrices[chapter.ChapterId] : 0;
                        decimal totalBoth = softPrice + audioPrice;
                        decimal comboDiscount = totalBoth * 0.1m; // Giảm 10% combo
                        decimal totalAfterCombo = totalBoth - comboDiscount;

                        // Áp dụng promotion nếu có
                        decimal finalTotal = promotionPercent.HasValue
                            ? totalAfterCombo * (1 - promotionPercent.Value / 100)
                            : totalAfterCombo;

                        // Giá sau giảm cho mỗi loại (chia theo tỷ lệ, bao gồm cả promotion)
                        decimal softFinalPrice = softPrice > 0 && totalBoth > 0
                            ? (softPrice / totalBoth) * finalTotal
                            : 0;
                        decimal audioFinalPrice = audioPrice > 0 && totalBoth > 0
                            ? (audioPrice / totalBoth) * finalTotal
                            : 0;

                        // Tạo OrderItem cho bản mềm
                        var softOrderItem = new OrderItem
                        {
                            CustomerId = userId,
                            ChapterId = chapter.ChapterId,
                            UnitPrice = softPrice,
                            CashSpent = softFinalPrice,
                            PaidAt = DateTime.UtcNow,
                            OrderType = "BuyChapterSoft",
                            PromotionId = promotion?.PromotionId // Lưu PromotionId nếu có
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
                                CashSpent = audioFinalPrice,
                                PaidAt = DateTime.UtcNow,
                                OrderType = "BuyChapterAudio",
                                PromotionId = promotion?.PromotionId // Lưu PromotionId nếu có
                            };
                            orderItemsToCreate.Add(audioOrderItem);
                        }
                    }
                    else
                    {
                        // Trường hợp mua riêng lẻ (soft hoặc audio)
                        decimal unitPrice = 0;
                        string orderType = "";

                        if (request.PurchaseType == "soft")
                        {
                            unitPrice = chapter.PriceSoft ?? 0;
                            orderType = "BuyChapterSoft";
                        }
                        else if (request.PurchaseType == "audio")
                        {
                            unitPrice = audioPrices.ContainsKey(chapter.ChapterId)
                                ? audioPrices[chapter.ChapterId]
                                : 0;
                            orderType = "BuyChapterAudio";
                        }

                        // Áp dụng promotion nếu có
                        decimal finalPrice = promotionPercent.HasValue
                            ? unitPrice * (1 - promotionPercent.Value / 100)
                            : unitPrice;

                        var orderItem = new OrderItem
                        {
                            CustomerId = userId,
                            ChapterId = chapter.ChapterId,
                            UnitPrice = unitPrice,
                            CashSpent = finalPrice, // Giá sau promotion
                            PaidAt = DateTime.UtcNow,
                            OrderType = orderType,
                            PromotionId = promotion?.PromotionId // Lưu PromotionId nếu có
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
                transaction.Complete();

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
