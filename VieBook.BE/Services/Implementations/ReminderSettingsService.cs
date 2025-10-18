using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class ReminderSettingsService : IReminderSettingsService
    {
        private readonly IReminderSettingsRepository _reminderSettingsRepository;
        private readonly IMapper _mapper;

        public ReminderSettingsService(IReminderSettingsRepository reminderSettingsRepository, IMapper mapper)
        {
            _reminderSettingsRepository = reminderSettingsRepository;
            _mapper = mapper;
        }

        public async Task<ReminderSettingsDTO?> GetByUserIdAsync(int userId)
        {
            var reminderSettings = await _reminderSettingsRepository.GetByUserIdAsync(userId);
            return reminderSettings != null ? _mapper.Map<ReminderSettingsDTO>(reminderSettings) : null;
        }

        public async Task<ReminderSettingsDTO> CreateAsync(int userId, CreateReminderSettingsDTO createDto)
        {
            // Kiểm tra xem user đã có settings chưa
            var existingSettings = await _reminderSettingsRepository.GetByUserIdAsync(userId);
            if (existingSettings != null)
            {
                // Nếu đã có, update thay vì tạo mới
                var updateDto = new UpdateReminderSettingsDTO
                {
                    DailyGoalMinutes = createDto.DailyGoalMinutes,
                    WeeklyGoalHours = createDto.WeeklyGoalHours,
                    ReminderMinutesBefore = createDto.ReminderMinutesBefore,
                    IsActive = createDto.IsActive
                };
                return await UpdateAsync(userId, updateDto);
            }

            var reminderSettings = new ReminderSettings
            {
                UserId = userId,
                DailyGoalMinutes = createDto.DailyGoalMinutes,
                WeeklyGoalHours = createDto.WeeklyGoalHours,
                ReminderMinutesBefore = createDto.ReminderMinutesBefore,
                IsActive = createDto.IsActive
            };

            var createdSettings = await _reminderSettingsRepository.CreateAsync(reminderSettings);
            return _mapper.Map<ReminderSettingsDTO>(createdSettings);
        }

        public async Task<ReminderSettingsDTO> UpdateAsync(int userId, UpdateReminderSettingsDTO updateDto)
        {
            var existingSettings = await _reminderSettingsRepository.GetByUserIdAsync(userId);
            if (existingSettings == null)
            {
                // Nếu chưa có settings, tạo mới
                var createDto = new CreateReminderSettingsDTO
                {
                    DailyGoalMinutes = updateDto.DailyGoalMinutes,
                    WeeklyGoalHours = updateDto.WeeklyGoalHours,
                    ReminderMinutesBefore = updateDto.ReminderMinutesBefore,
                    IsActive = updateDto.IsActive
                };
                return await CreateAsync(userId, createDto);
            }

            existingSettings.DailyGoalMinutes = updateDto.DailyGoalMinutes;
            existingSettings.WeeklyGoalHours = updateDto.WeeklyGoalHours;
            existingSettings.ReminderMinutesBefore = updateDto.ReminderMinutesBefore;
            existingSettings.IsActive = updateDto.IsActive;

            var updatedSettings = await _reminderSettingsRepository.UpdateAsync(existingSettings);
            return _mapper.Map<ReminderSettingsDTO>(updatedSettings);
        }

        public async Task<bool> DeleteAsync(int userId)
        {
            var existingSettings = await _reminderSettingsRepository.GetByUserIdAsync(userId);
            if (existingSettings == null)
                return false;

            return await _reminderSettingsRepository.DeleteAsync(existingSettings.ReminderSettingsId);
        }

        public async Task<List<ReminderSettingsDTO>> GetAllActiveAsync()
        {
            var activeSettings = await _reminderSettingsRepository.GetAllActiveAsync();
            return _mapper.Map<List<ReminderSettingsDTO>>(activeSettings);
        }
    }
}
