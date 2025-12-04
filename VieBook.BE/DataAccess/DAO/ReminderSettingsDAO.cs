using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class ReminderSettingsDAO
    {
        private readonly VieBookContext _context;

        public ReminderSettingsDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<ReminderSettings?> GetByUserIdAsync(int userId)
        {
            return await _context.ReminderSettings
                .FirstOrDefaultAsync(rs => rs.UserId == userId);
        }

        public async Task<ReminderSettings> CreateAsync(ReminderSettings reminderSettings)
        {
            _context.ReminderSettings.Add(reminderSettings);
            await _context.SaveChangesAsync();
            return reminderSettings;
        }

        public async Task<ReminderSettings> UpdateAsync(ReminderSettings reminderSettings)
        {
            reminderSettings.UpdatedAt = DateTime.UtcNow;
            _context.ReminderSettings.Update(reminderSettings);
            await _context.SaveChangesAsync();
            return reminderSettings;
        }

        public async Task<bool> DeleteAsync(int reminderSettingsId)
        {
            var reminderSettings = await _context.ReminderSettings
                .FindAsync(reminderSettingsId);
            
            if (reminderSettings == null)
                return false;

            _context.ReminderSettings.Remove(reminderSettings);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ReminderSettings>> GetAllActiveAsync()
        {
            return await _context.ReminderSettings
                .Where(rs => rs.IsActive)
                .ToListAsync();
        }
    }
}
