using BusinessObject.Dtos;
using DataAccess.DAO;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class ReadingStatsRepository : IReadingStatsRepository
    {
        private readonly ReadingStatsDAO _readingStatsDAO;

        public ReadingStatsRepository(ReadingStatsDAO readingStatsDAO)
        {
            _readingStatsDAO = readingStatsDAO;
        }

        public async Task<int> GetBooksReadCountAsync(int userId)
        {
            return await _readingStatsDAO.GetBooksReadCountAsync(userId);
        }

        public async Task<int> GetBooksPurchasedCountAsync(int userId)
        {
            return await _readingStatsDAO.GetBooksPurchasedCountAsync(userId);
        }

        public async Task<int> GetFavoritesCountAsync(int userId)
        {
            return await _readingStatsDAO.GetFavoritesCountAsync(userId);
        }

        public async Task<int> GetBooksListenedCountAsync(int userId)
        {
            return await _readingStatsDAO.GetBooksListenedCountAsync(userId);
        }
    }
}
