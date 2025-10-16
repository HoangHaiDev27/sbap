using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IReadingScheduleService
    {
        Task<IEnumerable<ReadingScheduleDTO>> GetReadingSchedulesByUserIdAsync(int userId);
        Task<IEnumerable<ReadingScheduleDTO>> GetReadingSchedulesByDateAsync(int userId, DateTime date);
        Task<ReadingScheduleDTO> GetReadingScheduleByIdAsync(int scheduleId);
        Task<ReadingScheduleDTO> CreateReadingScheduleAsync(CreateReadingScheduleDTO createDto, int userId);
        Task<ReadingScheduleDTO> UpdateReadingScheduleAsync(int scheduleId, UpdateReadingScheduleDTO updateDto);
        Task<bool> DeleteReadingScheduleAsync(int scheduleId);
        Task<ReadingScheduleStatsDTO> GetReadingScheduleStatsAsync(int userId);
        Task<bool> MarkScheduleCompletedAsync(int scheduleId);
    }
}
