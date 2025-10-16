using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class ReadingScheduleRepository : IReadingScheduleRepository
    {
        private readonly ReadingScheduleDAO _dao;

        public ReadingScheduleRepository(ReadingScheduleDAO dao)
        {
            _dao = dao;
        }

        public async Task<ReadingSchedule> CreateReadingScheduleAsync(ReadingSchedule readingSchedule)
        {
            return await _dao.CreateAsync(readingSchedule);
        }

        public async Task<bool> DeleteReadingScheduleAsync(int scheduleId)
        {
            return await _dao.DeleteAsync(scheduleId);
        }

        public async Task<ReadingSchedule?> GetReadingScheduleByIdAsync(int scheduleId)
        {
            return await _dao.GetByIdAsync(scheduleId);
        }

        public async Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByDateAsync(int userId, DateTime date)
        {
            return await _dao.GetByDateAsync(userId, date);
        }

        public async Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByUserIdAsync(int userId)
        {
            return await _dao.GetByUserIdAsync(userId);
        }

        public async Task<ReadingSchedule> UpdateReadingScheduleAsync(ReadingSchedule readingSchedule)
        {
            return await _dao.UpdateAsync(readingSchedule);
        }

        public async Task<IEnumerable<ReadingSchedule>> GetActiveReadingSchedulesAsync(int userId)
        {
            return await _dao.GetActiveAsync(userId);
        }

        public async Task<int> GetTotalReadingTimeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _dao.GetTotalReadingTimeAsync(userId, startDate, endDate);
        }

        public async Task<int> GetCompletedSchedulesCountAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _dao.GetCompletedSchedulesCountAsync(userId, startDate, endDate);
        }

        public async Task<int> GetCurrentStreakAsync(int userId)
        {
            return await _dao.GetCurrentStreakAsync(userId);
        }
    }
}
