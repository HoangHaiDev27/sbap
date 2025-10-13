using BusinessObject.Dtos;
using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IBookReviewService
    {
        Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10);
        Task<(bool Success, string Message, BookReview? Review)> CreateAsync(int userId, int bookId, byte rating, string? comment);
        Task<(bool Success, string Message)> OwnerReplyAsync(int ownerUserId, int reviewId, string reply);
        Task<bool> CanReviewAsync(int userId, int bookId);
    }
}


