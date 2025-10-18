using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IReminderSettingsRepository
    {
        Task<ReminderSettings?> GetByUserIdAsync(int userId);
        Task<ReminderSettings> CreateAsync(ReminderSettings reminderSettings);
        Task<ReminderSettings> UpdateAsync(ReminderSettings reminderSettings);
        Task<bool> DeleteAsync(int reminderSettingsId);
        Task<List<ReminderSettings>> GetAllActiveAsync();
    }
}
