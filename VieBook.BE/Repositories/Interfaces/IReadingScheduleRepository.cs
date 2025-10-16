using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IReadingScheduleRepository
    {
        Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByUserIdAsync(int userId);
        Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByDateAsync(int userId, DateTime date);
        Task<ReadingSchedule?> GetReadingScheduleByIdAsync(int scheduleId);
        Task<ReadingSchedule> CreateReadingScheduleAsync(ReadingSchedule readingSchedule);
        Task<ReadingSchedule> UpdateReadingScheduleAsync(ReadingSchedule readingSchedule);
        Task<bool> DeleteReadingScheduleAsync(int scheduleId);
        Task<IEnumerable<ReadingSchedule>> GetActiveReadingSchedulesAsync(int userId);
        Task<int> GetTotalReadingTimeAsync(int userId, DateTime startDate, DateTime endDate);
        Task<int> GetCompletedSchedulesCountAsync(int userId, DateTime startDate, DateTime endDate);
        Task<int> GetCurrentStreakAsync(int userId);
    }
}
