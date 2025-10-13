using BusinessObject.Dtos;
using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IBookReviewRepository
    {
        Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10);
        Task<BookReview?> GetByBookAndUserAsync(int bookId, int userId);
        Task<BookReview> CreateAsync(int bookId, int userId, byte rating, string? comment);
        Task<BookReviewDTO?> GetDtoByIdAsync(int reviewId);
        Task<bool> SetOwnerReplyAsync(int reviewId, int ownerUserId, string reply);
        Task<bool> HasPurchasedAnyChapterAsync(int userId, int bookId);
    }
}


