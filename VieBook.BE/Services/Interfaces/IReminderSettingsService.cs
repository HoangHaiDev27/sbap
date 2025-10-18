using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IReminderSettingsService
    {
        Task<ReminderSettingsDTO?> GetByUserIdAsync(int userId);
        Task<ReminderSettingsDTO> CreateAsync(int userId, CreateReminderSettingsDTO createDto);
        Task<ReminderSettingsDTO> UpdateAsync(int userId, UpdateReminderSettingsDTO updateDto);
        Task<bool> DeleteAsync(int userId);
        Task<List<ReminderSettingsDTO>> GetAllActiveAsync();
    }
}
