using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class BookDao
    {
        private readonly VieBookContext _context;
        public BookDao(VieBookContext context)
        {
            _context = context;
        }

        public async Task<Book?> GetBookDetailAsync(int id)
        {
            var book = await _context.Books
                            .Where(b => b.Status == "Approved")
                            .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                            .Include(b => b.Categories)
                            .Include(b => b.Chapters)
                                .ThenInclude(c => c.ChapterAudios) // Include ChapterAudios để lấy PriceAudio
                            .Include(b => b.BookReviews)
                                .ThenInclude(r => r.User)
                                .ThenInclude(u => u.UserProfile)
                            .FirstOrDefaultAsync(b => b.BookId == id);

            return book;
        }
        // full status
        public async Task<Book?> GetBookDetail(int id)
        {
            var book = await _context.Books
                            .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                            .Include(b => b.Categories)
                            .Include(b => b.Chapters)
                                .ThenInclude(c => c.ChapterAudios) // Include ChapterAudios để lấy PriceAudio
                            .Include(b => b.BookReviews)
                                .ThenInclude(r => r.User)
                                .ThenInclude(u => u.UserProfile)
                            .FirstOrDefaultAsync(b => b.BookId == id);

            return book;
        }
        //lấy book không có audio 
        public async Task<List<Book>> GetReadBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile) // lấy tác giả
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterSoftUrl != null))
                .ToListAsync();
        }

        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
        {
            return await _context.Chapters
                .Where(c => c.BookId == bookId && c.Status == "Active")
                .OrderBy(c => c.ChapterId)
                .ToListAsync();
        }
        // lấy sách audio
        public async Task<List<Book>> GetAudioBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters).ThenInclude(c => c.ChapterAudios)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterAudioUrl != null)) // chỉ sách có audio
                .ToListAsync();
        }

        public async Task<Book?> GetAudioBookDetailAsync(int id)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters).ThenInclude(c => c.ChapterAudios)
                .Include(b => b.BookReviews)
                    .ThenInclude(r => r.User).ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(b => b.BookId == id && b.Chapters.Any(c => c.ChapterAudioUrl != null));
        }


        public async Task<List<Book>> GetAllAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews).ThenInclude(r => r.User).ThenInclude(u => u.UserProfile)
                .ToListAsync();
        }

        public async Task AddAsync(Book book)
        {
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
        }

        // Thêm nhiều Category cho 1 Book bằng raw SQL
        public async Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds)
        {
            if (categoryIds == null || categoryIds.Count == 0) return;

            foreach (var catId in categoryIds)
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO BookCategories (BookId, CategoryId) VALUES ({0}, {1})",
                    bookId, catId);
            }
        }
        // Xoá toàn bộ Category liên kết với 1 Book
        public async Task RemoveCategoriesByBookIdAsync(int bookId)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM BookCategories WHERE BookId = {0}",
                bookId
            );
        }

        // check isbn
        public async Task<bool> IsIsbnExistsAsync(string isbn)
        {
            return await _context.Books.AnyAsync(b => b.Isbn == isbn);
        }
        public async Task UpdateAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Book book)
        {
            book.Status = "InActive";
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books.FindAsync(id);
        }

        // Lấy tất cả sách theo OwnerId
        public async Task<List<Book>> GetBooksByOwnerId(int ownerId)
        {
            return await _context.Books
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                    .ThenInclude(c => c.OrderItems)
                .Include(b => b.Chapters)
                    .ThenInclude(c => c.ChapterAudios)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Where(b => b.OwnerId == ownerId)
                .ToListAsync();
        }
        // Tìm kiếm sách theo tiêu đề, tác giả, mô tả
        public async Task<List<BookSearchReponseDTO?>> SearchBooksAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<BookSearchReponseDTO?>();
            var books = await _context.Books.
                Where(b => EF.Functions.Like(b.Title, $"%{query}%") ||
                           (b.Author != null && EF.Functions.Like(b.Author, $"%{query}%")))
                .Select(b => new BookSearchReponseDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    Author = b.Author,
                    CoverImageUrl = b.CoverUrl,
                }).Take(20) // Giới hạn kết quả trả về
                .ToListAsync();
            return books!;
        }
        // Lấy sách nói của category có lượt mua nhiều (top 10)
        public async Task<List<Book>> GetTopPurchasedAudioBooksByCategoryAsync(int categoryId)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters).ThenInclude(c => c.ChapterAudios)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterAudioUrl != null) // chỉ sách có audio
                            && b.Categories.Any(c => c.CategoryId == categoryId)) // thuộc category
                .OrderByDescending(b => b.Chapters.Sum(c => c.OrderItems.Count)) // sắp xếp theo tổng lượt mua
                .Take(10) // lấy top N
                .ToListAsync();
        }
        // Lấy sách đọc của category có lượt mua nhiều (top 10)
        public async Task<List<Book>> GetTopPurchasedReadBooksByCategoryAsync(int categoryId)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterSoftUrl != null)   // chỉ sách có soft copy
                            && b.Categories.Any(c => c.CategoryId == categoryId)) // thuộc category
                .OrderByDescending(b => b.Chapters.Sum(c => c.OrderItems.Count)) // sắp xếp theo tổng lượt mua
                .Take(10) // lấy top N
                .ToListAsync();
        }
        // Lấy sách nói có lượt mua nhiều (top 10)
        public async Task<List<Book>> GetTopPurchasedAudioBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters).ThenInclude(c => c.ChapterAudios)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterAudioUrl != null)) // chỉ sách có audio
                .OrderByDescending(b => b.Chapters.Sum(c => c.OrderItems.Count)) // sắp xếp theo tổng lượt mua
                .Take(10) // lấy top N
                .ToListAsync();
        }
        // Lấy sách đọc có lượt mua nhiều (top 10)
        public async Task<List<Book>> GetTopPurchasedReadBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews)
                .Where(b => b.Chapters.Any(c => c.ChapterSoftUrl != null)) // chỉ sách có soft copy
                .OrderByDescending(b => b.Chapters.Sum(c => c.OrderItems.Count)) // sắp xếp theo tổng lượt mua
                .Take(10) // lấy top N
                .ToListAsync();
        }
        // Lấy danh sách gợi ý sách
        public async Task<List<Book>> GetRecommendedBooksAsync(int? userId = null)
        {
            IQueryable<Book> query = _context.Books
                .Where(b => b.Status == "Approved")
                .Include(b => b.Owner).ThenInclude(u => u.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                .Include(b => b.BookReviews);

            if (userId == null)
            {
                // ✅ Trường hợp chưa đăng nhập: lấy sách mới nhất
                return await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(10)
                    .ToListAsync();
            }
            else
            {
                // ✅ Trường hợp đã đăng nhập: lấy category từ sách mà user đã mua
                var purchasedCategoryIds = await _context.OrderItems
                    .Where(o => o.CustomerId == userId)
                    .SelectMany(o => o.Chapter.Book.Categories.Select(c => c.CategoryId))
                    .Distinct()
                    .ToListAsync();

                if (purchasedCategoryIds == null || purchasedCategoryIds.Count == 0)
                {
                    // Nếu user chưa mua gì thì fallback về sách mới nhất
                    return await query
                        .OrderByDescending(b => b.CreatedAt)
                        .Take(10)
                        .ToListAsync();
                }

                // Lấy sách mới nhất thuộc các category đã mua
                return await query
                    .Where(b => b.Categories.Any(c => purchasedCategoryIds.Contains(c.CategoryId)))
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(10)
                    .ToListAsync();
            }
        }

        // Lấy giá audio từ ChapterAudios cho từng chapter
        public async Task<Dictionary<int, decimal>> GetChapterAudioPricesAsync(int bookId)
        {
            var audioPrices = await _context.ChapterAudios
                .Where(ca => ca.Chapter.BookId == bookId)
                .GroupBy(ca => ca.ChapterId)
                .Select(g => new { ChapterId = g.Key, Price = g.First().PriceAudio ?? 0 })
                .ToDictionaryAsync(x => x.ChapterId, x => x.Price);

            return audioPrices;
        }

        // Kiểm tra xem book có chapter nào có status = Active không
        public async Task<bool> CheckBookHasActiveChaptersAsync(int bookId)
        {
            return await _context.Chapters
                .Where(c => c.BookId == bookId && c.Status == "Active")
                .AnyAsync();
        }

        // Kiểm tra tất cả chapters của book có status = Active không
        // Kiểm tra book có chapter nào có status = Draft không
        public async Task<bool> CheckBookHasDraftChaptersAsync(int bookId)
        {
            return await _context.Chapters
                .Where(c => c.BookId == bookId && c.Status == "Draft")
                .AnyAsync();
        }

        public async Task<bool> CheckAllChaptersActiveAsync(int bookId)
        {
            var totalChapters = await _context.Chapters
                .Where(c => c.BookId == bookId)
                .CountAsync();

            if (totalChapters == 0) return false;

            var activeChapters = await _context.Chapters
                .Where(c => c.BookId == bookId && c.Status == "Active")
                .CountAsync();

            return totalChapters == activeChapters;
        }

        // Thay đổi status của tất cả chương Draft thành InActive
        public async Task UpdateDraftChaptersToInActiveAsync(int bookId)
        {
            var draftChapters = await _context.Chapters
                .Where(c => c.BookId == bookId && c.Status == "Draft")
                .ToListAsync();

            foreach (var chapter in draftChapters)
            {
                chapter.Status = "InActive";
            }

            await _context.SaveChangesAsync();
        }

        // Get active promotion for book
        public async Task<Promotion?> GetActivePromotionForBook(int bookId)
        {
            var now = DateTime.UtcNow;
            
            var promotion = await _context.Promotions
                .Where(p => p.Books.Any(b => b.BookId == bookId) // Book thuộc promotion này
                    && p.IsActive // Promotion còn active
                    && p.StartAt <= now // Đã bắt đầu
                    && p.EndAt >= now // Chưa hết hạn
                    && p.Quantity > 0) // Còn số lượng
                .OrderByDescending(p => p.DiscountValue) // Ưu tiên promotion có giá trị cao nhất
                .FirstOrDefaultAsync();
            
            return promotion;
        }

    }
}