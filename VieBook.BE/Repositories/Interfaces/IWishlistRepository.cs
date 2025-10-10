using BusinessObject.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IWishlistRepository
    {
        Task<bool> IsInWishlistAsync(int userId, int bookId);
        Task<Wishlist> AddAsync(int userId, int bookId);
        Task<bool> RemoveAsync(int userId, int bookId);
        Task<List<Book>> GetUserWishlistBooksAsync(int userId);
    }
}


