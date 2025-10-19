using BusinessObject.Models;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class ReadingStatsDAO
    {
        private readonly VieBookContext _context;

        public ReadingStatsDAO(VieBookContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy số sách đã đọc (Reading) của user
        /// </summary>
        public async Task<int> GetBooksReadCountAsync(int userId)
        {
            return await _context.ReadingHistories
                .Where(rh => rh.UserId == userId && rh.ReadingType == "Reading")
                .Select(rh => rh.BookId)
                .Distinct()
                .CountAsync();
        }

        /// <summary>
        /// Lấy số sách đã mua của user (tính theo số sách unique, không phải chapter)
        /// </summary>
        public async Task<int> GetBooksPurchasedCountAsync(int userId)
        {
            return await _context.OrderItems
                .Where(oi => oi.CustomerId == userId && oi.PaidAt != null)
                .Select(oi => oi.Chapter.BookId)
                .Distinct()
                .CountAsync();
        }

        /// <summary>
        /// Lấy số sách yêu thích của user
        /// </summary>
        public async Task<int> GetFavoritesCountAsync(int userId)
        {
            return await _context.Wishlists
                .Where(w => w.UserId == userId)
                .CountAsync();
        }

        /// <summary>
        /// Lấy số sách đã nghe (Listening) của user
        /// </summary>
        public async Task<int> GetBooksListenedCountAsync(int userId)
        {
            return await _context.ReadingHistories
                .Where(rh => rh.UserId == userId && rh.ReadingType == "Listening")
                .Select(rh => rh.BookId)
                .Distinct()
                .CountAsync();
        }
    }
}
