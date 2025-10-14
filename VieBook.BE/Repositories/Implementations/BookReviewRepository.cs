using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class BookReviewRepository : IBookReviewRepository
    {
        private readonly BookReviewDAO _dao;

        public BookReviewRepository(BookReviewDAO dao)
        {
            _dao = dao;
        }

        public Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10)
            => _dao.GetReviewsByBookIdAsync(bookId, ratingFilter, page, pageSize);
        public Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetReviewsByOwnerIdAsync(int ownerId, byte? ratingFilter = null, bool? hasReply = null, string? searchTerm = null, int page = 1, int pageSize = 10)
            => _dao.GetReviewsByOwnerIdAsync(ownerId, ratingFilter, hasReply, searchTerm, page, pageSize);
        public Task<object> GetOwnerReviewStatsAsync(int ownerId)
            => _dao.GetOwnerReviewStatsAsync(ownerId);
        public Task<BookReview?> GetByBookAndUserAsync(int bookId, int userId) => _dao.GetByBookAndUserAsync(bookId, userId);
        public Task<BookReview> CreateAsync(int bookId, int userId, byte rating, string? comment) => _dao.CreateAsync(bookId, userId, rating, comment);
        public Task<BookReviewDTO?> GetDtoByIdAsync(int reviewId) => _dao.GetDtoByIdAsync(reviewId);
        public Task<bool> SetOwnerReplyAsync(int reviewId, int ownerUserId, string reply) => _dao.SetOwnerReplyAsync(reviewId, ownerUserId, reply);
        public Task<bool> HasPurchasedAnyChapterAsync(int userId, int bookId) => _dao.HasPurchasedAnyChapterAsync(userId, bookId);
    }
}


