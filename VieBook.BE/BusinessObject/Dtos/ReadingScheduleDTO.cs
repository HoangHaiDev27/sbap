using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos
{
    public class ReadingScheduleDTO
    {
        public int ScheduleId { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookCoverUrl { get; set; } = string.Empty;
        public DateTime BeginReadAt { get; set; }
        public int ReadingTime { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReadingScheduleDTO
    {
        [Required]
        public int BookId { get; set; }
        
        [Required]
        public DateTime BeginReadAt { get; set; }
        
        [Required]
        [Range(1, 1440, ErrorMessage = "Reading time must be between 1 and 1440 minutes")]
        public int ReadingTime { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class UpdateReadingScheduleDTO
    {
        [Required]
        public DateTime BeginReadAt { get; set; }
        
        [Required]
        [Range(1, 1440, ErrorMessage = "Reading time must be between 1 and 1440 minutes")]
        public int ReadingTime { get; set; }
        
        public bool IsActive { get; set; }
    }

    public class ReadingScheduleStatsDTO
    {
        public int TotalTime { get; set; }
        public int CompletedSessions { get; set; }
        public int Streak { get; set; }
        public int TotalSchedules { get; set; }
    }
}
