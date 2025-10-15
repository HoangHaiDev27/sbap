using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class BookReviewService : IBookReviewService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IBookReviewRepository _reviewRepository;

        public BookReviewService(IBookRepository bookRepository, IBookReviewRepository reviewRepository)
        {
            _bookRepository = bookRepository;
            _reviewRepository = reviewRepository;
        }

        public Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10)
            => _reviewRepository.GetReviewsByBookIdAsync(bookId, ratingFilter, page, pageSize);

        public Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetReviewsByOwnerIdAsync(int ownerId, byte? ratingFilter = null, bool? hasReply = null, string? searchTerm = null, int page = 1, int pageSize = 10)
            => _reviewRepository.GetReviewsByOwnerIdAsync(ownerId, ratingFilter, hasReply, searchTerm, page, pageSize);

        public Task<object> GetOwnerReviewStatsAsync(int ownerId)
            => _reviewRepository.GetOwnerReviewStatsAsync(ownerId);

        public async Task<(bool Success, string Message, BookReview? Review)> CreateAsync(int userId, int bookId, byte rating, string? comment)
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null) return (false, "Book not found", null);

            // Only purchasers can review
            var hasPurchased = await _reviewRepository.HasPurchasedAnyChapterAsync(userId, bookId);
            if (!hasPurchased) return (false, "Bạn cần mua ít nhất một chương để đánh giá", null);

            // Ensure not duplicate
            var existing = await _reviewRepository.GetByBookAndUserAsync(bookId, userId);
            if (existing != null) return (false, "Bạn đã đánh giá sách này rồi", null);

            if (rating < 1 || rating > 5) return (false, "Rating phải từ 1 đến 5", null);

            var created = await _reviewRepository.CreateAsync(bookId, userId, rating, comment);
            // Map to DTO-like shape for FE immediately
            var dto = await _reviewRepository.GetDtoByIdAsync(created.ReviewId);
            // If mapping fails, still return entity (FE refresh covers it)
            if (dto != null)
            {
                var mapped = new BookReview
                {
                    ReviewId = dto.ReviewId,
                    UserId = dto.UserId,
                    Rating = dto.Rating,
                    Comment = dto.Comment,
                    CreatedAt = dto.CreatedAt
                };
                return (true, "Success", mapped);
            }
            return (true, "Success", created);
        }

        public async Task<(bool Success, string Message)> OwnerReplyAsync(int ownerUserId, int reviewId, string reply)
        {
            if (string.IsNullOrWhiteSpace(reply)) return (false, "Nội dung trả lời không được rỗng");

            var ok = await _reviewRepository.SetOwnerReplyAsync(reviewId, ownerUserId, reply);
            return ok ? (true, "Success") : (false, "Không thể trả lời. Kiểm tra quyền sở hữu sách.");
        }

        public Task<bool> CanReviewAsync(int userId, int bookId)
            => _reviewRepository.HasPurchasedAnyChapterAsync(userId, bookId);
    }
}


