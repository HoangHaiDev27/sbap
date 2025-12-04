using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class ReadingStatsService : IReadingStatsService
    {
        private readonly IReadingStatsRepository _readingStatsRepository;

        public ReadingStatsService(IReadingStatsRepository readingStatsRepository)
        {
            _readingStatsRepository = readingStatsRepository;
        }

        public async Task<int> GetBooksReadCountAsync(int userId)
        {
            return await _readingStatsRepository.GetBooksReadCountAsync(userId);
        }

        public async Task<int> GetBooksPurchasedCountAsync(int userId)
        {
            return await _readingStatsRepository.GetBooksPurchasedCountAsync(userId);
        }

        public async Task<int> GetFavoritesCountAsync(int userId)
        {
            return await _readingStatsRepository.GetFavoritesCountAsync(userId);
        }

        public async Task<int> GetBooksListenedCountAsync(int userId)
        {
            return await _readingStatsRepository.GetBooksListenedCountAsync(userId);
        }
    }
}
