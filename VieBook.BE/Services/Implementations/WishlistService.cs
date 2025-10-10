using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepository;

        public WishlistService(IWishlistRepository wishlistRepository)
        {
            _wishlistRepository = wishlistRepository;
        }

        public Task<bool> IsInWishlistAsync(int userId, int bookId)
        {
            return _wishlistRepository.IsInWishlistAsync(userId, bookId);
        }

        public async Task<bool> AddAsync(int userId, int bookId)
        {
            await _wishlistRepository.AddAsync(userId, bookId);
            return true;
        }

        public Task<bool> RemoveAsync(int userId, int bookId)
        {
            return _wishlistRepository.RemoveAsync(userId, bookId);
        }

        public async Task<bool> ToggleAsync(int userId, int bookId)
        {
            var exists = await _wishlistRepository.IsInWishlistAsync(userId, bookId);
            if (exists)
            {
                await _wishlistRepository.RemoveAsync(userId, bookId);
                return false;
            }
            await _wishlistRepository.AddAsync(userId, bookId);
            return true;
        }

        public Task<List<Book>> GetUserWishlistBooksAsync(int userId)
        {
            return _wishlistRepository.GetUserWishlistBooksAsync(userId);
        }
    }
}


