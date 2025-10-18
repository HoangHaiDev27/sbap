using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class ReminderSettingsRepository : IReminderSettingsRepository
    {
        private readonly ReminderSettingsDAO _dao;

        public ReminderSettingsRepository(ReminderSettingsDAO dao)
        {
            _dao = dao;
        }

        public Task<ReminderSettings?> GetByUserIdAsync(int userId)
            => _dao.GetByUserIdAsync(userId);

        public Task<ReminderSettings> CreateAsync(ReminderSettings reminderSettings)
            => _dao.CreateAsync(reminderSettings);

        public Task<ReminderSettings> UpdateAsync(ReminderSettings reminderSettings)
            => _dao.UpdateAsync(reminderSettings);

        public Task<bool> DeleteAsync(int reminderSettingsId)
            => _dao.DeleteAsync(reminderSettingsId);

        public Task<List<ReminderSettings>> GetAllActiveAsync()
            => _dao.GetAllActiveAsync();
    }
}
