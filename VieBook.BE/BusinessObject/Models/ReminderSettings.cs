using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    [Table("ReminderSettings")]
    public class ReminderSettings
    {
        [Key]
        public int ReminderSettingsId { get; set; }

        [Required]
        public int UserId { get; set; }

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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
