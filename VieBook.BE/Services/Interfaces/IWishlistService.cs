using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IWishlistService
    {
        Task<bool> IsInWishlistAsync(int userId, int bookId);
        Task<bool> AddAsync(int userId, int bookId);
        Task<bool> RemoveAsync(int userId, int bookId);
        Task<bool> ToggleAsync(int userId, int bookId);
        Task<List<WishlistBookDTO>> GetUserWishlistBooksAsync(int userId);
    }
}


