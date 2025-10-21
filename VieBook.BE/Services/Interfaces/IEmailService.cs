using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendEmailAsync(string to, string? cc, string subject, string body, string? attachmentPath = null);
        Task SendReadingReminderAsync(ReminderSettings settings, ReadingSchedule schedule);
        Task SendDailyGoalReminderAsync(ReminderSettings settings, int currentMinutes, int goalMinutes);
        Task SendWeeklyGoalReminderAsync(ReminderSettings settings, int currentHours, int goalHours);
        Task ProcessAllRemindersAsync();
    }
}
