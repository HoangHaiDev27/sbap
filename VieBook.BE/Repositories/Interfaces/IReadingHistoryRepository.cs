using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IReadingHistoryRepository
    {
        Task<List<ReadingHistoryDTO>> GetReadingHistoryByUserIdAsync(int userId, ReadingHistoryFilterDTO? filter = null);
        Task<ReadingHistoryDTO?> GetReadingHistoryByIdAsync(long readingHistoryId);
        Task<ReadingHistoryDTO?> GetCurrentReadingProgressAsync(int userId, int bookId, int? chapterId, string readingType);
        Task<long> CreateReadingHistoryAsync(CreateReadingHistoryDTO createDto, int userId);
        Task<bool> UpdateReadingHistoryAsync(UpdateReadingHistoryDTO updateDto);
        Task<bool> DeleteReadingHistoryAsync(long readingHistoryId);
        Task<int> GetTotalReadingHistoryCountAsync(int userId, ReadingHistoryFilterDTO? filter = null);
        Task<List<ReadingHistory>> GetByUserIdAsync(int userId);
    }
}
