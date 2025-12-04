using BusinessObject.Dtos;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class ReadingHistoryRepository : IReadingHistoryRepository
    {
        private readonly ReadingHistoryDAO _readingHistoryDAO;

        public ReadingHistoryRepository(ReadingHistoryDAO readingHistoryDAO)
        {
            _readingHistoryDAO = readingHistoryDAO;
        }

        public async Task<List<ReadingHistoryDTO>> GetReadingHistoryByUserIdAsync(int userId, ReadingHistoryFilterDTO? filter = null)
        {
            return await _readingHistoryDAO.GetReadingHistoryByUserIdAsync(userId, filter);
        }

        public async Task<ReadingHistoryDTO?> GetReadingHistoryByIdAsync(long readingHistoryId)
        {
            return await _readingHistoryDAO.GetReadingHistoryByIdAsync(readingHistoryId);
        }

        public async Task<ReadingHistoryDTO?> GetCurrentReadingProgressAsync(int userId, int bookId, int? chapterId, string readingType)
        {
            return await _readingHistoryDAO.GetCurrentReadingProgressAsync(userId, bookId, chapterId, readingType);
        }

        public async Task<long> CreateReadingHistoryAsync(CreateReadingHistoryDTO createDto, int userId)
        {
            return await _readingHistoryDAO.CreateReadingHistoryAsync(createDto, userId);
        }

        public async Task<bool> UpdateReadingHistoryAsync(UpdateReadingHistoryDTO updateDto)
        {
            return await _readingHistoryDAO.UpdateReadingHistoryAsync(updateDto);
        }

        public async Task<bool> DeleteReadingHistoryAsync(long readingHistoryId)
        {
            return await _readingHistoryDAO.DeleteReadingHistoryAsync(readingHistoryId);
        }

        public async Task<int> GetTotalReadingHistoryCountAsync(int userId, ReadingHistoryFilterDTO? filter = null)
        {
            return await _readingHistoryDAO.GetTotalReadingHistoryCountAsync(userId, filter);
        }
    }
}
