using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class ReadingScheduleDAO
    {
        private readonly VieBookContext _context;

        public ReadingScheduleDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<ReadingSchedule> CreateAsync(ReadingSchedule readingSchedule)
        {
            _context.ReadingSchedules.Add(readingSchedule);
            await _context.SaveChangesAsync();
            return readingSchedule;
        }

        public async Task<bool> DeleteAsync(int scheduleId)
        {
            var schedule = await _context.ReadingSchedules.FindAsync(scheduleId);
            if (schedule == null) return false;
            _context.ReadingSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ReadingSchedule?> GetByIdAsync(int scheduleId)
        {
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .FirstOrDefaultAsync(rs => rs.ScheduleId == scheduleId);
        }

        public async Task<IEnumerable<ReadingSchedule>> GetByDateAsync(int userId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .Where(rs => rs.UserId == userId && rs.BeginReadAt >= startOfDay && rs.BeginReadAt < endOfDay)
                .OrderBy(rs => rs.BeginReadAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReadingSchedule>> GetByUserIdAsync(int userId)
        {
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .Where(rs => rs.UserId == userId)
                .OrderByDescending(rs => rs.BeginReadAt)
                .ToListAsync();
        }

        public async Task<ReadingSchedule> UpdateAsync(ReadingSchedule readingSchedule)
        {
            _context.ReadingSchedules.Update(readingSchedule);
            await _context.SaveChangesAsync();
            return readingSchedule;
        }

        public async Task<IEnumerable<ReadingSchedule>> GetActiveAsync(int userId)
        {
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .Where(rs => rs.UserId == userId && rs.IsActive)
                .OrderBy(rs => rs.BeginReadAt)
                .ToListAsync();
        }

        public async Task<int> GetTotalReadingTimeAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.ReadingSchedules
                .Where(rs => rs.UserId == userId && rs.BeginReadAt >= startDate && rs.BeginReadAt <= endDate)
                .SumAsync(rs => rs.ReadingTime);
        }

        public async Task<int> GetCompletedSchedulesCountAsync(int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.ReadingSchedules
                .Where(rs => rs.UserId == userId && rs.BeginReadAt >= startDate && rs.BeginReadAt <= endDate && rs.IsActive == false)
                .CountAsync();
        }

        public async Task<int> GetCurrentStreakAsync(int userId)
        {
            var today = DateTime.Today;
            var streak = 0;
            for (int i = 0; i < 30; i++)
            {
                var checkDate = today.AddDays(-i);
                var hasSchedule = await _context.ReadingSchedules.AnyAsync(rs => rs.UserId == userId && rs.BeginReadAt.Date == checkDate);
                if (hasSchedule) streak++; else break;
            }
            return streak;
        }
    }
}


