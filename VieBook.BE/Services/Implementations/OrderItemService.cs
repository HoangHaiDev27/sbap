using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Linq;

namespace Services.Implementations
{
    // Helper class for grouped book data
    public class BookGroupInfo
    {
        public BusinessObject.Models.Book Book { get; set; } = null!;
        public List<OrderItem> OrderItems { get; set; } = new();
        public int TotalChapters { get; set; }
        public int PurchasedChapters { get; set; }
        public DateTime? LatestPurchase { get; set; }
        public decimal TotalSpent { get; set; }
    }
    public class OrderItemService : IOrderItemService
    {
        private readonly IOrderItemRepository _orderItemRepository;

        public OrderItemService(IOrderItemRepository orderItemRepository)
        {
            _orderItemRepository = orderItemRepository;
        }

        public async Task<IEnumerable<PurchasedBookDTO>> GetPurchasedBooksAsync(int userId, int page, int pageSize, string timeFilter, string sortBy)
        {
            var orderItems = await _orderItemRepository.GetPurchasedBooksByUserIdAsync(userId);
            
            // Group by book to combine chapters
            var groupedByBook = orderItems
                .GroupBy(oi => oi.Chapter.Book.BookId)
                .Select(group => new BookGroupInfo
                {
                    Book = group.First().Chapter.Book,
                    OrderItems = group.ToList(),
                    TotalChapters = group.First().Chapter.Book.Chapters.Count,
                    PurchasedChapters = group.Count(),
                    LatestPurchase = group.Max(oi => oi.PaidAt),
                    TotalSpent = group.Sum(oi => oi.CashSpent)
                });
            
            // Filter by time
            var filteredItems = FilterByTime(groupedByBook, timeFilter);
            
            // Sort
            var sortedItems = SortGroupedItems(filteredItems, sortBy);
            
            // Paginate
            var paginatedItems = sortedItems
                .Skip((page - 1) * pageSize)
                .Take(pageSize);

            return paginatedItems.Select(MapGroupedToPurchasedBookDTO);
        }

        public async Task<IEnumerable<PurchasedBookDTO>> GetAllPurchasedBooksAsync(int userId, string timeFilter, string sortBy)
        {
            var orderItems = await _orderItemRepository.GetPurchasedBooksByUserIdAsync(userId);
            
            // Group by book to combine chapters
            var groupedByBook = orderItems
                .GroupBy(oi => oi.Chapter.Book.BookId)
                .Select(group => new BookGroupInfo
                {
                    Book = group.First().Chapter.Book,
                    OrderItems = group.ToList(),
                    TotalChapters = group.First().Chapter.Book.Chapters.Count,
                    PurchasedChapters = group.Count(),
                    LatestPurchase = group.Max(oi => oi.PaidAt),
                    TotalSpent = group.Sum(oi => oi.CashSpent)
                });
            
            // Filter by time
            var filteredItems = FilterByTime(groupedByBook, timeFilter);
            
            // Sort
            var sortedItems = SortGroupedItems(filteredItems, sortBy);

            return sortedItems.Select(MapGroupedToPurchasedBookDTO);
        }

        public async Task<PurchasedBookDTO?> GetOrderItemByIdAsync(long orderItemId)
        {
            var orderItem = await _orderItemRepository.GetOrderItemByIdAsync(orderItemId);
            return orderItem != null ? MapToPurchasedBookDTO(orderItem) : null;
        }

        public async Task<IEnumerable<object>> GetPurchasedChaptersByBookAsync(int userId, int bookId)
        {
            var orderItems = await _orderItemRepository.GetPurchasedBooksByUserIdAsync(userId);
            
            var purchasedChapters = orderItems
                .Where(oi => oi.Chapter.Book.BookId == bookId)
                .Select(oi => new
                {
                    OrderItemId = oi.OrderItemId,
                    ChapterId = oi.Chapter.ChapterId,
                    ChapterTitle = oi.Chapter.ChapterTitle,
                    OrderType = oi.OrderType,
                    UnitPrice = oi.UnitPrice,
                    CashSpent = oi.CashSpent,
                    PaidAt = oi.PaidAt,
                    Duration = oi.Chapter.DurationSec.HasValue ? 
                        $"{oi.Chapter.DurationSec.Value / 3600}h {(oi.Chapter.DurationSec.Value % 3600) / 60}m" : 
                        "Không xác định"
                })
                .OrderBy(c => c.ChapterId);

            return purchasedChapters;
        }

        public async Task<int> GetPurchasedBooksCountAsync(int userId, string timeFilter)
        {
            var orderItems = await _orderItemRepository.GetPurchasedBooksByUserIdAsync(userId);
            
            // Group by book to count unique books
            var groupedByBook = orderItems
                .GroupBy(oi => oi.Chapter.Book.BookId)
                .Select(group => new BookGroupInfo
                {
                    Book = group.First().Chapter.Book,
                    OrderItems = group.ToList(),
                    TotalChapters = group.First().Chapter.Book.Chapters.Count,
                    PurchasedChapters = group.Count(),
                    LatestPurchase = group.Max(oi => oi.PaidAt),
                    TotalSpent = group.Sum(oi => oi.CashSpent)
                });
            
            // Apply time filter
            var filteredItems = FilterByTime(groupedByBook, timeFilter);
            
            return filteredItems.Count();
        }

        private IEnumerable<BookGroupInfo> FilterByTime(IEnumerable<BookGroupInfo> groupedItems, string timeFilter)
        {
            var now = DateTime.UtcNow;
            
            return timeFilter switch
            {
                "today" => groupedItems.Where(g => g.LatestPurchase?.Date == now.Date),
                "week" => groupedItems.Where(g => g.LatestPurchase >= now.AddDays(-7)),
                "month" => groupedItems.Where(g => g.LatestPurchase >= now.AddMonths(-1)),
                "year" => groupedItems.Where(g => g.LatestPurchase >= now.AddYears(-1)),
                _ => groupedItems
            };
        }

        private IEnumerable<BookGroupInfo> SortGroupedItems(IEnumerable<BookGroupInfo> groupedItems, string sortBy)
        {
            return sortBy switch
            {
                "recent" => groupedItems.OrderByDescending(g => g.LatestPurchase),
                "oldest" => groupedItems.OrderBy(g => g.LatestPurchase),
                "name" => groupedItems.OrderBy(g => g.Book.Title),
                "price_high" => groupedItems.OrderByDescending(g => g.TotalSpent),
                "price_low" => groupedItems.OrderBy(g => g.TotalSpent),
                _ => groupedItems.OrderByDescending(g => g.LatestPurchase)
            };
        }

        private PurchasedBookDTO MapToPurchasedBookDTO(OrderItem orderItem)
        {
            var book = orderItem.Chapter.Book;
            var category = book.Categories.FirstOrDefault()?.Name ?? "Không xác định";
            
            // Determine format based on order type and chapter content
            string format = DetermineFormat(orderItem);
            string duration = DetermineDuration(orderItem);
            string size = DetermineSize(orderItem);

            return new PurchasedBookDTO
            {
                OrderItemId = orderItem.OrderItemId,
                BookId = book.BookId,
                Title = book.Title,
                Author = book.Author,
                CoverUrl = book.CoverUrl,
                Category = category,
                UnitPrice = orderItem.UnitPrice,
                CashSpent = orderItem.CashSpent,
                PaidAt = orderItem.PaidAt,
                OrderType = orderItem.OrderType,
                Format = format,
                Duration = duration,
                Size = size,
                Rating = CalculateBookRating(book),
                Downloads = 1, // Default value, can be enhanced later
                Status = "available"
            };
        }

        private string DetermineFormat(OrderItem orderItem)
        {
            var chapter = orderItem.Chapter;
            bool hasAudio = !string.IsNullOrEmpty(chapter.ChapterAudioUrl);
            bool hasEbook = !string.IsNullOrEmpty(chapter.ChapterSoftUrl);

            if (hasAudio && hasEbook)
                return "ebook + audiobook";
            else if (hasAudio)
                return "audiobook";
            else
                return "ebook";
        }

        private string DetermineDuration(OrderItem orderItem)
        {
            var durationSec = orderItem.Chapter.DurationSec;
            if (durationSec.HasValue)
            {
                var hours = durationSec.Value / 3600;
                var minutes = (durationSec.Value % 3600) / 60;
                return $"{hours}h {minutes}m";
            }
            return "Không xác định";
        }

        private string DetermineSize(OrderItem orderItem)
        {
            // This is a placeholder - in real implementation, you might want to 
            // calculate actual file sizes or store them in the database
            var durationSec = orderItem.Chapter.DurationSec;
            if (durationSec.HasValue)
            {
                // Rough estimation: 1MB per minute for audio
                var estimatedSizeMB = (durationSec.Value / 60.0) * 1.0;
                if (estimatedSizeMB < 1024)
                    return $"{estimatedSizeMB:F0} MB";
                else
                    return $"{estimatedSizeMB / 1024:F1} GB";
            }
            return "Không xác định";
        }

        private double CalculateBookRating(BusinessObject.Models.Book book)
        {
            // Calculate average rating from book reviews
            if (book.BookReviews != null && book.BookReviews.Any())
            {
                return book.BookReviews.Average(br => br.Rating);
            }
            return 4.5; // Default rating
        }

        private PurchasedBookDTO MapGroupedToPurchasedBookDTO(BookGroupInfo groupedData)
        {
            var book = groupedData.Book;
            var orderItems = groupedData.OrderItems;
            var category = book.Categories.FirstOrDefault()?.Name ?? "Không xác định";
            
            // Determine format based on order types
            string format = DetermineGroupedFormat(orderItems);
            string duration = DetermineGroupedDuration(orderItems);
            string size = DetermineGroupedSize(orderItems);

            return new PurchasedBookDTO
            {
                OrderItemId = orderItems.First().OrderItemId, // Use first order item ID
                BookId = book.BookId,
                Title = book.Title,
                Author = book.Author,
                CoverUrl = book.CoverUrl,
                Category = category,
                UnitPrice = groupedData.TotalSpent,
                CashSpent = groupedData.TotalSpent,
                PaidAt = groupedData.LatestPurchase,
                OrderType = format,
                Format = format,
                Duration = duration,
                Size = size,
                Rating = CalculateBookRating(book),
                Downloads = 1, // Default value
                Status = "available",
                // New properties for chapter info
                PurchasedChapters = groupedData.PurchasedChapters,
                TotalChapters = groupedData.TotalChapters
            };
        }

        private string DetermineGroupedFormat(List<OrderItem> orderItems)
        {
            bool hasAudio = orderItems.Any(oi => oi.OrderType == "audiobook");
            bool hasEbook = orderItems.Any(oi => oi.OrderType == "ebook");
            bool hasCombo = orderItems.Any(oi => oi.OrderType == "combo");

            if (hasCombo || (hasAudio && hasEbook))
                return "ebook + audiobook";
            else if (hasAudio)
                return "audiobook";
            else
                return "ebook";
        }

        private string DetermineGroupedDuration(List<OrderItem> orderItems)
        {
            var totalDuration = orderItems
                .Where(oi => oi.Chapter.DurationSec.HasValue)
                .Sum(oi => oi.Chapter.DurationSec.Value);
            
            if (totalDuration > 0)
            {
                var hours = totalDuration / 3600;
                var minutes = (totalDuration % 3600) / 60;
                return $"{hours}h {minutes}m";
            }
            return "Không xác định";
        }

        private string DetermineGroupedSize(List<OrderItem> orderItems)
        {
            var totalDuration = orderItems
                .Where(oi => oi.Chapter.DurationSec.HasValue)
                .Sum(oi => oi.Chapter.DurationSec.Value);
            
            if (totalDuration > 0)
            {
                // Rough estimation: 1MB per minute for audio
                var estimatedSizeMB = (totalDuration / 60.0) * 1.0;
                if (estimatedSizeMB < 1024)
                    return $"{estimatedSizeMB:F0} MB";
                else
                    return $"{estimatedSizeMB / 1024:F1} GB";
            }
            return "Không xác định";
        }

        public async Task<IEnumerable<object>> GetOwnerOrderItemsAsync(int ownerId)
        {
            var orderItems = await _orderItemRepository.GetOwnerOrderItemsAsync(ownerId);
            
            return orderItems.Select(oi => new
            {
                OrderItemId = oi.OrderItemId,
                CustomerId = oi.CustomerId,
                CustomerName = oi.Customer?.UserProfile?.FullName ?? "Không xác định",
                CustomerEmail = oi.Customer?.Email ?? "Không xác định",
                BookId = oi.Chapter.Book.BookId,
                BookTitle = oi.Chapter.Book.Title,
                BookCoverUrl = oi.Chapter.Book.CoverUrl,
                ChapterId = oi.Chapter.ChapterId,
                ChapterTitle = oi.Chapter.ChapterTitle,
                UnitPrice = oi.UnitPrice,
                CashSpent = oi.CashSpent,
                OrderType = oi.OrderType,
                PaidAt = oi.PaidAt,
                Status = GetOrderStatus(oi.OrderType)
            });
        }

        public async Task<object> GetOwnerOrderStatsAsync(int ownerId)
        {
            return await _orderItemRepository.GetOwnerOrderStatsAsync(ownerId);
        }

        public async Task<object> GetOrderDetailByIdAsync(long orderItemId)
        {
            var orderItem = await _orderItemRepository.GetOrderItemByIdAsync(orderItemId);
            if (orderItem == null)
            {
                return null;
            }

            return new
            {
                OrderItemId = orderItem.OrderItemId,
                CustomerId = orderItem.CustomerId,
                CustomerName = orderItem.Customer?.UserProfile?.FullName ?? "Không xác định",
                CustomerEmail = orderItem.Customer?.Email ?? "Không xác định",
                BookId = orderItem.Chapter.Book.BookId,
                BookTitle = orderItem.Chapter.Book.Title,
                BookCoverUrl = orderItem.Chapter.Book.CoverUrl,
                ChapterId = orderItem.Chapter.ChapterId,
                ChapterTitle = orderItem.Chapter.ChapterTitle,
                UnitPrice = orderItem.UnitPrice,
                CashSpent = orderItem.CashSpent,
                OrderType = orderItem.OrderType,
                PaidAt = orderItem.PaidAt,
                Status = GetOrderStatus(orderItem.OrderType)
            };
        }

        private string GetOrderStatus(string? orderType)
        {
            return orderType switch
            {
                "BuyChapter" => "Hoàn thành",
                "BuyChapterSoft" => "Hoàn thành",
                "BuyChapterAudio" => "Hoàn thành",
                "BuyChapterBoth" => "Hoàn thành",
                "Refund" => "Đã hoàn tiền",
                _ => "Không xác định"
            };
        }
    }
}
