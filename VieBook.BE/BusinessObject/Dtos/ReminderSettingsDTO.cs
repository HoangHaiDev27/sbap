using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos
{
    public class ReminderSettingsDTO
    {
        public int ReminderSettingsId { get; set; }
        public int UserId { get; set; }
        public int DailyGoalMinutes { get; set; }
        public int WeeklyGoalHours { get; set; }
        public int ReminderMinutesBefore { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateReminderSettingsDTO
    {
        [Required]
        [Range(1, 1440)]
        public int DailyGoalMinutes { get; set; } = 30;

        [Required]
        [Range(1, 168)]
        public int WeeklyGoalHours { get; set; } = 5;

        [Required]
        [Range(5, 60)]
        public int ReminderMinutesBefore { get; set; } = 15;

        [Required]
        public bool IsActive { get; set; } = true;
    }

    public class UpdateReminderSettingsDTO
    {
        [Required]
        [Range(1, 1440)]
        public int DailyGoalMinutes { get; set; }

        [Required]
        [Range(1, 168)]
        public int WeeklyGoalHours { get; set; }

        [Required]
        [Range(5, 60)]
        public int ReminderMinutesBefore { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
