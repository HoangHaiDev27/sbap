using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class ReadingScheduleRepository : IReadingScheduleRepository
    {
        private readonly VieBookContext _context;

        public ReadingScheduleRepository(VieBookContext context)
        {
            _context = context;
        }

        public async Task<ReadingSchedule> CreateReadingScheduleAsync(ReadingSchedule readingSchedule)
        {
            _context.ReadingSchedules.Add(readingSchedule);
            await _context.SaveChangesAsync();
            return readingSchedule;
        }

        public async Task<bool> DeleteReadingScheduleAsync(int scheduleId)
        {
            var schedule = await _context.ReadingSchedules.FindAsync(scheduleId);
            if (schedule == null) return false;

            _context.ReadingSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ReadingSchedule?> GetReadingScheduleByIdAsync(int scheduleId)
        {
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .FirstOrDefaultAsync(rs => rs.ScheduleId == scheduleId);
        }

        public async Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByDateAsync(int userId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .Where(rs => rs.UserId == userId && 
                           rs.BeginReadAt >= startOfDay && 
                           rs.BeginReadAt < endOfDay)
                .OrderBy(rs => rs.BeginReadAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReadingSchedule>> GetReadingSchedulesByUserIdAsync(int userId)
        {
            return await _context.ReadingSchedules
                .Include(rs => rs.Book)
                .Include(rs => rs.User)
                .Where(rs => rs.UserId == userId)
                .OrderByDescending(rs => rs.BeginReadAt)
                .ToListAsync();
        }

        public async Task<ReadingSchedule> UpdateReadingScheduleAsync(ReadingSchedule readingSchedule)
        {
            _context.ReadingSchedules.Update(readingSchedule);
            await _context.SaveChangesAsync();
            return readingSchedule;
        }

        public async Task<IEnumerable<ReadingSchedule>> GetActiveReadingSchedulesAsync(int userId)
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
                .Where(rs => rs.UserId == userId && 
                           rs.BeginReadAt >= startDate && 
                           rs.BeginReadAt <= endDate)
                .SumAsync(rs => rs.ReadingTime);
        }

        public async Task<int> GetCompletedSchedulesCountAsync(int userId, DateTime startDate, DateTime endDate)
        {
            // Note: This is a simplified implementation. In a real scenario, you might need
            // a separate table to track completion status or add a CompletedAt field
            return await _context.ReadingSchedules
                .Where(rs => rs.UserId == userId && 
                           rs.BeginReadAt >= startDate && 
                           rs.BeginReadAt <= endDate &&
                           rs.IsActive == false) // Assuming inactive means completed
                .CountAsync();
        }

        public async Task<int> GetCurrentStreakAsync(int userId)
        {
            // This is a simplified implementation. In a real scenario, you would need
            // to track daily completion status to calculate streaks properly
            var today = DateTime.Today;
            var streak = 0;
            
            for (int i = 0; i < 30; i++) // Check last 30 days
            {
                var checkDate = today.AddDays(-i);
                var hasSchedule = await _context.ReadingSchedules
                    .AnyAsync(rs => rs.UserId == userId && 
                                  rs.BeginReadAt.Date == checkDate);
                
                if (hasSchedule)
                {
                    streak++;
                }
                else
                {
                    break;
                }
            }
            
            return streak;
        }
    }
}
