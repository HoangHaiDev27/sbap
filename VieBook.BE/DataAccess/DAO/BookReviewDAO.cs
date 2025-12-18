using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class BookReviewDAO
    {
        private readonly VieBookContext _context;

        public BookReviewDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10)
        {
            var query = _context.BookReviews.AsQueryable();
            query = query.Where(r => r.BookId == bookId);
            if (ratingFilter.HasValue)
            {
                query = query.Where(r => r.Rating == ratingFilter.Value);
            }

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new BookReviewDTO
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    UserName = r.User.UserProfile != null ? r.User.UserProfile.FullName : r.User.Email,
                    AvatarUrl = r.User.UserProfile != null ? r.User.UserProfile.AvatarUrl : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    OwnerReply = r.OwnerReply,
                    OwnerReplyAt = r.OwnerReplyAt
                })
                .ToListAsync();
        }

        public async Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetReviewsByOwnerIdAsync(int ownerId, byte? ratingFilter = null, bool? hasReply = null, string? searchTerm = null, int page = 1, int pageSize = 10)
        {
            var query = _context.BookReviews
                .Where(r => r.Book.OwnerId == ownerId);
            
            if (ratingFilter.HasValue)
            {
                query = query.Where(r => r.Rating == ratingFilter.Value);
            }

            if (hasReply.HasValue)
            {
                if (hasReply.Value)
                {
                    query = query.Where(r => !string.IsNullOrEmpty(r.OwnerReply));
                }
                else
                {
                    query = query.Where(r => string.IsNullOrEmpty(r.OwnerReply));
                }
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(r => r.Book.Title.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new BookReviewDTO
                {
                    ReviewId = r.ReviewId,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    UserId = r.UserId,
                    UserName = r.User.UserProfile != null ? r.User.UserProfile.FullName : r.User.Email,
                    AvatarUrl = r.User.UserProfile != null ? r.User.UserProfile.AvatarUrl : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    OwnerReply = r.OwnerReply,
                    OwnerReplyAt = r.OwnerReplyAt
                })
                .ToListAsync();

            return (reviews, totalCount);
        }

        public async Task<object> GetOwnerReviewStatsAsync(int ownerId)
        {
            var allReviews = await _context.BookReviews
                .Where(r => r.Book.OwnerId == ownerId)
                .ToListAsync();

            var totalReviews = allReviews.Count;
            var averageRating = totalReviews > 0 
                ? Math.Round((double)allReviews.Sum(r => r.Rating) / totalReviews, 1)
                : 0.0;
            var unRepliedCount = allReviews.Count(r => string.IsNullOrEmpty(r.OwnerReply));
            var fiveStarCount = allReviews.Count(r => r.Rating == 5);
            var fiveStarPercentage = totalReviews > 0 
                ? Math.Round((double)fiveStarCount / totalReviews * 100, 0)
                : 0;

            return new
            {
                totalReviews,
                averageRating,
                unRepliedCount,
                fiveStarPercentage
            };
        }

        public Task<BookReview?> GetByBookAndUserAsync(int bookId, int userId)
            => _context.BookReviews.FirstOrDefaultAsync(r => r.BookId == bookId && r.UserId == userId);

        public async Task<BookReview> CreateAsync(int bookId, int userId, byte rating, string? comment)
        {
            var entity = new BookReview
            {
                BookId = bookId,
                UserId = userId,
                Rating = rating,
                Comment = comment
            };
            _context.BookReviews.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<BookReviewDTO?> GetDtoByIdAsync(int reviewId)
        {
            return await _context.BookReviews
                .Where(r => r.ReviewId == reviewId)
                .Select(r => new BookReviewDTO
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    UserName = r.User.UserProfile != null ? r.User.UserProfile.FullName : r.User.Email,
                    AvatarUrl = r.User.UserProfile != null ? r.User.UserProfile.AvatarUrl : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SetOwnerReplyAsync(int reviewId, int ownerUserId, string reply)
        {
            var review = await _context.BookReviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId);
            if (review == null) return false;

            // verify ownership
            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == review.BookId);
            if (book == null || book.OwnerId != ownerUserId) return false;

            review.OwnerReply = reply;
            review.OwnerReplyAt = System.DateTime.UtcNow;
            review.OwnerReplyBy = ownerUserId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HasPurchasedAnyChapterAsync(int userId, int bookId)
        {
            return await _context.OrderItems
                .Join(_context.Chapters, oi => oi.ChapterId, c => c.ChapterId, (oi, c) => new { oi, c })
                .AnyAsync(x => x.oi.CustomerId == userId && x.c.BookId == bookId);
        }

        public async Task<List<BookReviewDTO>> GetAllForStaffAsync()
        {
            return await _context.BookReviews
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new BookReviewDTO
                {
                    ReviewId = r.ReviewId,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    UserId = r.UserId,
                    UserName = r.User.UserProfile != null ? r.User.UserProfile.FullName : r.User.Email,
                    AvatarUrl = r.User.UserProfile != null ? r.User.UserProfile.AvatarUrl : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    OwnerReply = r.OwnerReply,
                    OwnerReplyAt = r.OwnerReplyAt
                })
                .ToListAsync();
        }

        public async Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetAllForStaffPagedAsync(
            int page = 1, 
            int pageSize = 10, 
            string? searchTerm = null, 
            int? bookId = null)
        {
            var query = _context.BookReviews.AsQueryable();

            // Filter by bookId
            if (bookId.HasValue)
            {
                query = query.Where(r => r.BookId == bookId.Value);
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(r => 
                    (r.User.UserProfile != null && r.User.UserProfile.FullName.ToLower().Contains(search)) ||
                    (r.User.Email.ToLower().Contains(search)) ||
                    (r.Comment != null && r.Comment.ToLower().Contains(search)) ||
                    (r.Book.Title.ToLower().Contains(search))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new BookReviewDTO
                {
                    ReviewId = r.ReviewId,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    UserId = r.UserId,
                    UserName = r.User.UserProfile != null ? r.User.UserProfile.FullName : r.User.Email,
                    AvatarUrl = r.User.UserProfile != null ? r.User.UserProfile.AvatarUrl : null,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    OwnerReply = r.OwnerReply,
                    OwnerReplyAt = r.OwnerReplyAt
                })
                .ToListAsync();

            return (reviews, totalCount);
        }

        public async Task<bool> DeleteAsync(int reviewId)
        {
            try
            {
                var review = await _context.BookReviews.FindAsync(reviewId);
                if (review == null) return false;

                _context.BookReviews.Remove(review);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa BookReview: {ex.Message}");
                return false;
            }
        }

        public async Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null)
        {
            // Sử dụng query trực tiếp không cần Include vì CountAsync chỉ cần đếm
            var query = _context.BookReviews.AsQueryable();

            // Filter by bookId
            if (bookId.HasValue)
            {
                query = query.Where(r => r.BookId == bookId.Value);
            }

            // Search filter - EF Core sẽ tự động join khi filter trên navigation properties
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(r => 
                    (r.User.UserProfile != null && r.User.UserProfile.FullName != null && r.User.UserProfile.FullName.ToLower().Contains(search)) ||
                    (r.User.Email != null && r.User.Email.ToLower().Contains(search)) ||
                    (r.Comment != null && r.Comment.ToLower().Contains(search)) ||
                    (r.Book.Title != null && r.Book.Title.ToLower().Contains(search))
                );
            }

            return await query.CountAsync();
        }

        public async Task<List<BookReview>> GetReviewsByUserIdAsync(int userId)
        {
            return await _context.BookReviews
                .Where(r => r.UserId == userId)
                .Include(r => r.Book)
                .ToListAsync();
        }
    }
}


