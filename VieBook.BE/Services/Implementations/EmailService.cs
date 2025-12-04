using Microsoft.Extensions.Configuration;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;
using Microsoft.Extensions.Logging;

namespace Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly VieBookContext _context;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, VieBookContext context, ILogger<EmailService> logger)
        {
            _config = config;
            _context = context;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            await SendEmailAsync(to, null, subject, body, null);
        }

        public async Task SendEmailAsync(string to, string? cc, string subject, string body, string? attachmentPath = null)
        {
            var smtpServer = _config["EmailSettings:SmtpServer"];
            var port = int.Parse(_config["EmailSettings:Port"]);
            var senderEmail = _config["EmailSettings:SenderEmail"];
            var senderName = _config["EmailSettings:SenderName"];
            var username = _config["EmailSettings:Username"];
            var password = _config["EmailSettings:Password"];

            var message = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            
            message.To.Add(to);
            
            if (!string.IsNullOrWhiteSpace(cc))
            {
                message.CC.Add(cc);
            }
            
            if (!string.IsNullOrWhiteSpace(attachmentPath) && System.IO.File.Exists(attachmentPath))
            {
                var attachment = new Attachment(attachmentPath);
                message.Attachments.Add(attachment);
            }

            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }

        public async Task SendReadingReminderAsync(ReminderSettings settings, ReadingSchedule schedule)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserProfile)
                    .FirstOrDefaultAsync(u => u.UserId == settings.UserId);

                if (user == null) return;

                var userName = user.UserProfile?.FullName ?? user.Email;
                var bookTitle = schedule.Book?.Title ?? "Sách";
                
                // Convert UTC time to Vietnam time (UTC+7) for display
                var vietnamTime = schedule.BeginReadAt.AddHours(7);
                var scheduleTime = vietnamTime.ToString("HH:mm");
                var scheduleDate = vietnamTime.ToString("dd/MM/yyyy");

                var subject = $"Nhắc nhở đọc sách - {bookTitle}";
                var body = $@"
                    <h2>📚 Nhắc nhở đọc sách</h2>
                    <p>Xin chào {userName},</p>
                    <p>Bạn có lịch đọc sách <strong>{bookTitle}</strong> vào lúc <strong>{scheduleTime}</strong> ngày <strong>{scheduleDate}</strong>.</p>
                    <p>Hãy chuẩn bị và bắt đầu đọc sách nhé!</p>
                    <p>Chúc bạn có những phút giây đọc sách thú vị!</p>
                    <br>
                    <p>Trân trọng,<br>VieBook Team</p>
                ";

                await SendEmailAsync(user.Email, subject, body);
                _logger.LogInformation($"Reading reminder sent to {user.Email} for schedule {schedule.ScheduleId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending reading reminder for schedule {schedule.ScheduleId}");
            }
        }

        public async Task SendDailyGoalReminderAsync(ReminderSettings settings, int currentMinutes, int goalMinutes)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserProfile)
                    .FirstOrDefaultAsync(u => u.UserId == settings.UserId);

                if (user == null) return;

                var userName = user.UserProfile?.FullName ?? user.Email;
                var remainingMinutes = goalMinutes - currentMinutes;
                var progressPercent = (currentMinutes * 100) / goalMinutes;

                var subject = $"Mục tiêu đọc sách hàng ngày - {progressPercent}% hoàn thành";
                var body = $@"
                    <h2>📖 Báo cáo mục tiêu đọc sách hàng ngày</h2>
                    <p>Xin chào {userName},</p>
                    <p>Hôm nay bạn đã đọc được <strong>{currentMinutes} phút</strong> trong tổng mục tiêu <strong>{goalMinutes} phút</strong>.</p>
                    <p>Tiến độ: <strong>{progressPercent}%</strong></p>
                    <p>Còn lại: <strong>{remainingMinutes} phút</strong> để hoàn thành mục tiêu hôm nay.</p>
                    {(remainingMinutes > 0 ? "<p>Hãy cố gắng đọc thêm để đạt mục tiêu nhé!</p>" : "<p>🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu hôm nay!</p>")}
                    <br>
                    <p>Trân trọng,<br>VieBook Team</p>
                ";

                await SendEmailAsync(user.Email, subject, body);
                _logger.LogInformation($"Daily goal reminder sent to {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending daily goal reminder for user {settings.UserId}");
            }
        }

        public async Task SendWeeklyGoalReminderAsync(ReminderSettings settings, int currentHours, int goalHours)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.UserProfile)
                    .FirstOrDefaultAsync(u => u.UserId == settings.UserId);

                if (user == null) return;

                var userName = user.UserProfile?.FullName ?? user.Email;
                var remainingHours = goalHours - currentHours;
                var progressPercent = (currentHours * 100) / goalHours;

                var subject = $"Mục tiêu đọc sách hàng tuần - {progressPercent}% hoàn thành";
                var body = $@"
                    <h2>📚 Báo cáo mục tiêu đọc sách hàng tuần</h2>
                    <p>Xin chào {userName},</p>
                    <p>Tuần này bạn đã đọc được <strong>{currentHours} giờ</strong> trong tổng mục tiêu <strong>{goalHours} giờ</strong>.</p>
                    <p>Tiến độ: <strong>{progressPercent}%</strong></p>
                    <p>Còn lại: <strong>{remainingHours} giờ</strong> để hoàn thành mục tiêu tuần này.</p>
                    {(remainingHours > 0 ? "<p>Hãy cố gắng đọc thêm để đạt mục tiêu nhé!</p>" : "<p>🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu tuần này!</p>")}
                    <br>
                    <p>Trân trọng,<br>VieBook Team</p>
                ";

                await SendEmailAsync(user.Email, subject, body);
                _logger.LogInformation($"Weekly goal reminder sent to {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending weekly goal reminder for user {settings.UserId}");
            }
        }

        public async Task ProcessAllRemindersAsync()
        {
            try
            {
                var now = DateTime.UtcNow; // Sử dụng UTC để so sánh với database
                _logger.LogInformation("🔍 Processing reminders at UTC time: {utcTime} (Local: {localTime})", now, DateTime.Now);
                
                var activeSettings = await _context.ReminderSettings
                    .Where(rs => rs.IsActive)
                    .Include(rs => rs.User)
                    .ToListAsync();

                _logger.LogInformation("📧 Found {count} active reminder settings", activeSettings.Count);

                foreach (var settings in activeSettings)
                {
                    _logger.LogInformation("👤 Processing reminders for user {userId} (Email: {email})", 
                        settings.UserId, settings.User?.Email);
                    await ProcessUserRemindersAsync(settings, now);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error processing all reminders");
            }
        }

        private async Task ProcessUserRemindersAsync(ReminderSettings settings, DateTime now)
        {
            try
            {
                _logger.LogInformation("🔍 Checking reminders for user {userId} at {now}", settings.UserId, now);
                
                // 1. Kiểm tra lịch trình sắp tới
                var upcomingSchedules = await _context.ReadingSchedules
                    .Include(rs => rs.Book)
                    .Where(rs => rs.UserId == settings.UserId 
                        && rs.IsActive 
                        && rs.BeginReadAt > now 
                        && rs.BeginReadAt <= now.AddMinutes(settings.ReminderMinutesBefore))
                    .ToListAsync();

                _logger.LogInformation("📅 Found {count} upcoming schedules for user {userId}", 
                    upcomingSchedules.Count, settings.UserId);
                
                foreach (var schedule in upcomingSchedules)
                {
                    _logger.LogInformation("📧 Sending reminder for schedule {scheduleId} at {beginTime} (Book: {bookTitle})", 
                        schedule.ScheduleId, schedule.BeginReadAt, schedule.Book?.Title);
                    await SendReadingReminderAsync(settings, schedule);
                }

                // 2. Kiểm tra mục tiêu hàng ngày (gửi vào cuối ngày)
                if (now.Hour >= 22) // 10 PM trở đi
                {
                    var today = now.Date;
                    var todaySchedules = await _context.ReadingSchedules
                        .Where(rs => rs.UserId == settings.UserId 
                            && rs.BeginReadAt.Date == today)
                        .ToListAsync();

                    var totalMinutesToday = todaySchedules.Sum(rs => rs.ReadingTime);
                    
                    // Chỉ gửi nếu có dữ liệu đọc trong ngày
                    if (totalMinutesToday > 0)
                    {
                        await SendDailyGoalReminderAsync(settings, totalMinutesToday, settings.DailyGoalMinutes);
                    }
                }

                // 3. Kiểm tra mục tiêu hàng tuần (gửi vào chủ nhật)
                if (now.DayOfWeek == DayOfWeek.Sunday && now.Hour >= 20) // 8 PM Sunday trở đi
                {
                    // Tính từ đầu tuần (Monday)
                    var daysFromMonday = ((int)now.DayOfWeek + 6) % 7; // Sunday = 0, Monday = 1, etc.
                    var weekStart = now.Date.AddDays(-daysFromMonday);
                    var weekSchedules = await _context.ReadingSchedules
                        .Where(rs => rs.UserId == settings.UserId 
                            && rs.BeginReadAt.Date >= weekStart 
                            && rs.BeginReadAt.Date <= now.Date)
                        .ToListAsync();

                    var totalHoursThisWeek = weekSchedules.Sum(rs => rs.ReadingTime) / 60.0;
                    
                    // Chỉ gửi nếu có dữ liệu đọc trong tuần
                    if (totalHoursThisWeek > 0)
                    {
                        await SendWeeklyGoalReminderAsync(settings, (int)totalHoursThisWeek, settings.WeeklyGoalHours);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing reminders for user {settings.UserId}");
            }
        }
    }
}
