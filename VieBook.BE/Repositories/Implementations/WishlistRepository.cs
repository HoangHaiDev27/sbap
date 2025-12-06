using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using BusinessObject.Dtos;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly WishlistDAO _wishlistDao;

        public WishlistRepository(WishlistDAO wishlistDao)
        {
            _wishlistDao = wishlistDao;
        }

        public async Task<bool> IsInWishlistAsync(int userId, int bookId)
        {
            return await _wishlistDao.IsInWishlistAsync(userId, bookId);
        }

        public async Task<Wishlist> AddAsync(int userId, int bookId)
        {
            return await _wishlistDao.AddAsync(userId, bookId);
        }

        public async Task<bool> RemoveAsync(int userId, int bookId)
        {
            return await _wishlistDao.RemoveAsync(userId, bookId);
        }

        public async Task<List<WishlistBookDTO>> GetUserWishlistBooksAsync(int userId)
        {
            return await _wishlistDao.GetUserWishlistBooksAsync(userId);
        }

        public async Task<List<Wishlist>> GetWishlistsByBookIdsAsync(List<int> bookIds)
        {
            return await _wishlistDao.GetWishlistsByBookIdsAsync(bookIds);
        }
    }
}


