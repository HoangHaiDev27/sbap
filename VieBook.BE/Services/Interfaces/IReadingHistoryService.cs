using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IReadingHistoryService
    {
        Task<List<ReadingHistoryResponseDTO>> GetReadingHistoryByUserIdAsync(int userId, ReadingHistoryFilterDTO? filter = null);
        Task<ReadingHistoryResponseDTO?> GetReadingHistoryByIdAsync(long readingHistoryId);
        Task<ReadingHistoryResponseDTO?> GetCurrentReadingProgressAsync(int userId, int bookId, int? chapterId, string readingType);
        Task<ReadingHistoryResponseDTO> CreateReadingHistoryAsync(CreateReadingHistoryDTO createDto, int userId);
        Task<ReadingHistoryResponseDTO?> UpdateReadingHistoryAsync(UpdateReadingHistoryDTO updateDto);
        Task<bool> DeleteReadingHistoryAsync(long readingHistoryId);
        Task<(List<ReadingHistoryResponseDTO> Items, int TotalCount)> GetReadingHistoryWithPaginationAsync(int userId, ReadingHistoryFilterDTO filter);
    }
}
