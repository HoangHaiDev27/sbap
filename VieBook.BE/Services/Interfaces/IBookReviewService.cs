using BusinessObject.Dtos;
using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IBookReviewService
    {
        Task<List<BookReviewDTO>> GetReviewsByBookIdAsync(int bookId, byte? ratingFilter = null, int page = 1, int pageSize = 10);
        Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetReviewsByOwnerIdAsync(int ownerId, byte? ratingFilter = null, bool? hasReply = null, string? searchTerm = null, int page = 1, int pageSize = 10);
        Task<object> GetOwnerReviewStatsAsync(int ownerId);
        Task<(bool Success, string Message, BookReview? Review)> CreateAsync(int userId, int bookId, byte rating, string? comment);
        Task<(bool Success, string Message)> OwnerReplyAsync(int ownerUserId, int reviewId, string reply);
        Task<bool> CanReviewAsync(int userId, int bookId);
        Task<List<BookReviewDTO>> GetAllForStaffAsync();
        Task<(List<BookReviewDTO> Reviews, int TotalCount)> GetAllForStaffPagedAsync(int page = 1, int pageSize = 10, string? searchTerm = null, int? bookId = null);
        Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null);
        Task<bool> DeleteAsync(int reviewId);
    }
}


