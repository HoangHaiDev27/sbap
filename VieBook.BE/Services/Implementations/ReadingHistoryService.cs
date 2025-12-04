using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;
using DataAccess.DAO;

namespace Services.Implementations
{
    public class ReadingHistoryService : IReadingHistoryService
    {
        private readonly IReadingHistoryRepository _readingHistoryRepository;

        public ReadingHistoryService(IReadingHistoryRepository readingHistoryRepository)
        {
            _readingHistoryRepository = readingHistoryRepository;
        }

        public async Task<List<ReadingHistoryResponseDTO>> GetReadingHistoryByUserIdAsync(int userId, ReadingHistoryFilterDTO? filter = null)
        {
            var readingHistoryList = await _readingHistoryRepository.GetReadingHistoryByUserIdAsync(userId, filter);
            return readingHistoryList.Select(MapToResponseDTO).ToList();
        }

        public async Task<ReadingHistoryResponseDTO?> GetReadingHistoryByIdAsync(long readingHistoryId)
        {
            var readingHistory = await _readingHistoryRepository.GetReadingHistoryByIdAsync(readingHistoryId);
            return readingHistory != null ? MapToResponseDTO(readingHistory) : null;
        }

        public async Task<ReadingHistoryResponseDTO?> GetCurrentReadingProgressAsync(int userId, int bookId, int? chapterId, string readingType)
        {
            var readingHistory = await _readingHistoryRepository.GetCurrentReadingProgressAsync(userId, bookId, chapterId, readingType);
            return readingHistory != null ? MapToResponseDTO(readingHistory) : null;
        }

        public async Task<ReadingHistoryResponseDTO> CreateReadingHistoryAsync(CreateReadingHistoryDTO createDto, int userId)
        {
            try
            {
                // Kiểm tra xem đã có lịch sử đọc cho user + book + readingType này chưa (không phân biệt chapter)
                var existingHistory = await _readingHistoryRepository.GetCurrentReadingProgressAsync(userId, createDto.BookId, null, createDto.ReadingType);
                
                if (existingHistory != null)
                {
                    // Nếu đã có, cập nhật chapterId, audioPosition và lastReadAt
                    var updateDto = new UpdateReadingHistoryDTO
                    {
                        ReadingHistoryId = existingHistory.ReadingHistoryId,
                        ChapterId = createDto.ChapterId,
                        AudioPosition = createDto.AudioPosition
                    };
                    
                    var updated = await _readingHistoryRepository.UpdateReadingHistoryAsync(updateDto);
                    if (updated)
                    {
                        var updatedHistory = await _readingHistoryRepository.GetReadingHistoryByIdAsync(existingHistory.ReadingHistoryId);
                        return MapToResponseDTO(updatedHistory!);
                    }
                }

                // Tạo mới nếu chưa có
                var readingHistoryId = await _readingHistoryRepository.CreateReadingHistoryAsync(createDto, userId);
                var newHistory = await _readingHistoryRepository.GetReadingHistoryByIdAsync(readingHistoryId);
                return MapToResponseDTO(newHistory!);
            }
            catch (Exception ex) when (ex.InnerException?.Message.Contains("UQ_ReadingHistory_UserBookType") == true)
            {
                // Nếu bị unique constraint violation, thử lại với logic update
                var existingHistory = await _readingHistoryRepository.GetCurrentReadingProgressAsync(userId, createDto.BookId, null, createDto.ReadingType);
                if (existingHistory != null)
                {
                    var updateDto = new UpdateReadingHistoryDTO
                    {
                        ReadingHistoryId = existingHistory.ReadingHistoryId,
                        ChapterId = createDto.ChapterId,
                        AudioPosition = createDto.AudioPosition
                    };
                    
                    var updated = await _readingHistoryRepository.UpdateReadingHistoryAsync(updateDto);
                    if (updated)
                    {
                        var updatedHistory = await _readingHistoryRepository.GetReadingHistoryByIdAsync(existingHistory.ReadingHistoryId);
                        return MapToResponseDTO(updatedHistory!);
                    }
                }
                
                throw; // Re-throw nếu không xử lý được
            }
        }

        public async Task<ReadingHistoryResponseDTO?> UpdateReadingHistoryAsync(UpdateReadingHistoryDTO updateDto)
        {
            var updated = await _readingHistoryRepository.UpdateReadingHistoryAsync(updateDto);
            if (updated)
            {
                var updatedHistory = await _readingHistoryRepository.GetReadingHistoryByIdAsync(updateDto.ReadingHistoryId);
                return updatedHistory != null ? MapToResponseDTO(updatedHistory) : null;
            }
            return null;
        }

        public async Task<bool> DeleteReadingHistoryAsync(long readingHistoryId)
        {
            return await _readingHistoryRepository.DeleteReadingHistoryAsync(readingHistoryId);
        }

        public async Task<(List<ReadingHistoryResponseDTO> Items, int TotalCount)> GetReadingHistoryWithPaginationAsync(int userId, ReadingHistoryFilterDTO filter)
        {
            var items = await _readingHistoryRepository.GetReadingHistoryByUserIdAsync(userId, filter);
            var totalCount = await _readingHistoryRepository.GetTotalReadingHistoryCountAsync(userId, filter);
            
            return (items.Select(MapToResponseDTO).ToList(), totalCount);
        }

        private ReadingHistoryResponseDTO MapToResponseDTO(ReadingHistoryDTO dto)
        {
            return new ReadingHistoryResponseDTO
            {
                ReadingHistoryId = dto.ReadingHistoryId,
                BookId = dto.BookId,
                ChapterId = dto.ChapterId,
                ReadingType = dto.ReadingType,
                AudioPosition = dto.AudioPosition,
                LastReadAt = dto.LastReadAt,
                BookTitle = dto.BookTitle ?? string.Empty,
                CoverUrl = dto.CoverUrl,
                ChapterTitle = dto.ChapterTitle,
                Author = dto.Author
            };
        }
    }
}
