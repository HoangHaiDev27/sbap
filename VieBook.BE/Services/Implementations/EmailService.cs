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
using Repositories.Interfaces;

namespace Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly VieBookContext _context;
        private readonly ILogger<EmailService> _logger;
        private readonly IPromotionRepository _promotionRepository;
        private readonly IWishlistRepository _wishlistRepository;

        public EmailService(
            IConfiguration config, 
            VieBookContext context, 
            ILogger<EmailService> logger,
            IPromotionRepository promotionRepository,
            IWishlistRepository wishlistRepository)
        {
            _config = config;
            _context = context;
            _logger = logger;
            _promotionRepository = promotionRepository;
            _wishlistRepository = wishlistRepository;
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

        /// <summary>
        /// Xử lý gửi email cho users có sách trong wishlist khi promotion bắt đầu hôm nay
        /// </summary>
        /// <param name="frontendBaseUrl">URL base của frontend</param>
        public async Task ProcessWishlistPromotionsAsync(string frontendBaseUrl)
        {
            try
            {
                var now = DateTime.UtcNow;
                
                _logger.LogInformation("🎁 Processing wishlist promotions at UTC: {utcTime}", now);
                _logger.LogInformation("🌐 Frontend URL: {frontendUrl}", frontendBaseUrl);

                // 1. Lấy các promotions BẮT ĐẦU HÔM NAY qua Repository
                var todayPromotions = await _promotionRepository.GetPromotionsStartingTodayAsync();

                _logger.LogInformation("📢 Found {count} promotions starting today", todayPromotions.Count);

                if (!todayPromotions.Any())
                {
                    _logger.LogInformation("✅ No promotions starting today. Job completed.");
                    return;
                }

                // 2. Lấy tất cả BookIds từ các promotions
                var promotionBookIds = todayPromotions
                    .SelectMany(p => p.Books.Select(b => b.BookId))
                    .Distinct()
                    .ToList();

                _logger.LogInformation("📚 Total unique books in promotions: {count}", promotionBookIds.Count);

                // 3. Tìm users có sách trong Wishlist qua Repository
                var wishlistData = await _wishlistRepository.GetWishlistsByBookIdsAsync(promotionBookIds);

                _logger.LogInformation("💝 Found {count} wishlist entries matching promotion books", wishlistData.Count);

                if (!wishlistData.Any())
                {
                    _logger.LogInformation("✅ No users have promotion books in wishlist. Job completed.");
                    return;
                }

                // 4. Group theo user để gửi 1 email tổng hợp cho mỗi user
                var userWishlists = wishlistData
                    .GroupBy(w => w.UserId)
                    .ToList();

                _logger.LogInformation("👥 Sending emails to {count} users", userWishlists.Count);

                foreach (var userGroup in userWishlists)
                {
                    try
                    {
                        var user = userGroup.First().User;
                        if (user == null || string.IsNullOrEmpty(user.Email))
                        {
                            _logger.LogWarning("⚠️ User {userId} has no email, skipping", userGroup.Key);
                            continue;
                        }

                        // Lấy thông tin sách + promotion tương ứng
                        var booksWithPromotions = new List<(Book Book, Promotion Promotion)>();
                        
                        foreach (var wishlist in userGroup)
                        {
                            var book = wishlist.Book;
                            var promotion = todayPromotions.FirstOrDefault(p => 
                                p.Books.Any(b => b.BookId == book.BookId));
                            
                            if (promotion != null)
                            {
                                booksWithPromotions.Add((book, promotion));
                            }
                        }

                        if (booksWithPromotions.Any())
                        {
                            await SendWishlistPromotionEmailAsync(user, booksWithPromotions, frontendBaseUrl);
                            _logger.LogInformation("📧 Email sent to {email} for {count} books", 
                                user.Email, booksWithPromotions.Count);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Error sending email to user {userId}", userGroup.Key);
                    }
                }

                _logger.LogInformation("✅ Wishlist promotion job completed. Sent emails to {count} users", userWishlists.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in ProcessWishlistPromotionsAsync");
                throw;
            }
        }

        /// <summary>
        /// Gửi email thông báo promotion cho user với danh sách sách trong wishlist
        /// </summary>
        private async Task SendWishlistPromotionEmailAsync(User user, List<(Book Book, Promotion Promotion)> booksWithPromotions, string frontendBaseUrl)
        {
            var userName = user.UserProfile?.FullName ?? user.Email.Split('@')[0];
            
            // Build danh sách sách HTML
            var booksHtml = new StringBuilder();
            foreach (var (book, promotion) in booksWithPromotions)
            {
                // Tính giá gốc và giá sau giảm
                var originalPrice = book.Chapters?
                    .Where(c => c.Status == "Active")
                    .Sum(c => c.PriceSoft ?? 0) ?? 0;
                
                var discountedPrice = promotion.DiscountType == "Percent"
                    ? originalPrice * (1 - promotion.DiscountValue / 100)
                    : originalPrice - promotion.DiscountValue;
                
                // Convert EndAt sang Vietnam time để hiển thị
                var endDateVietnam = promotion.EndAt.AddHours(7).ToString("dd/MM/yyyy HH:mm");
                
                // URL chi tiết sách
                var bookUrl = $"{frontendBaseUrl}/bookdetails/{book.BookId}";
                
                booksHtml.AppendLine($@"
                <tr>
                    <td style='padding: 15px; border-bottom: 1px solid #eee;'>
                        <table cellpadding='0' cellspacing='0' border='0' width='100%'>
                            <tr>
                                <td width='80' style='vertical-align: top;'>
                                    <img src='{book.CoverUrl ?? "https://via.placeholder.com/80x120"}' 
                                         alt='{book.Title}' 
                                         style='width: 80px; height: 120px; object-fit: cover; border-radius: 8px;'>
                                </td>
                                <td style='padding-left: 15px; vertical-align: top;'>
                                    <h3 style='margin: 0 0 8px 0; color: #333; font-size: 16px;'>{book.Title}</h3>
                                    <p style='margin: 0 0 5px 0; color: #666; font-size: 14px;'>Tác giả: {book.Author ?? "Không rõ"}</p>
                                    <p style='margin: 0 0 8px 0;'>
                                        <span style='text-decoration: line-through; color: #999; font-size: 14px;'>{originalPrice:N0} xu</span>
                                        <span style='color: #e74c3c; font-weight: bold; font-size: 18px; margin-left: 10px;'>{discountedPrice:N0} xu</span>
                                        <span style='background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;'>-{promotion.DiscountValue}%</span>
                                    </p>
                                    <p style='margin: 0 0 10px 0; color: #f39c12; font-size: 13px;'>⏰ Khuyến mãi đến: {endDateVietnam}</p>
                                    <a href='{bookUrl}' 
                                       style='display: inline-block; background: #3498db; color: white; padding: 8px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;'>
                                        Xem chi tiết →
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>");
            }

            var wishlistUrl = $"{frontendBaseUrl}/library?tab=favorites";
            var homeUrl = frontendBaseUrl;

            var subject = $"🎉 {booksWithPromotions.Count} sách yêu thích của bạn đang được giảm giá!";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <table cellpadding='0' cellspacing='0' border='0' width='100%' style='background-color: #f4f4f4; padding: 20px;'>
        <tr>
            <td align='center'>
                <table cellpadding='0' cellspacing='0' border='0' width='600' style='background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                    <!-- Header -->
                    <tr>
                        <td style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>
                            <h1 style='margin: 0; color: white; font-size: 28px;'>🎁 Tin vui cho bạn!</h1>
                            <p style='margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;'>Sách trong danh sách yêu thích đang được giảm giá</p>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style='padding: 25px 30px 15px 30px;'>
                            <p style='margin: 0; font-size: 16px; color: #333;'>Xin chào <strong>{userName}</strong>,</p>
                            <p style='margin: 15px 0 0 0; font-size: 15px; color: #555; line-height: 1.6;'>
                                Chúng tôi vui mừng thông báo rằng <strong style='color: #e74c3c;'>{booksWithPromotions.Count} cuốn sách</strong> 
                                trong danh sách yêu thích của bạn hiện đang có chương trình khuyến mãi đặc biệt!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Books List -->
                    <tr>
                        <td style='padding: 0 30px;'>
                            <table cellpadding='0' cellspacing='0' border='0' width='100%' style='background: #fafafa; border-radius: 8px;'>
                                {booksHtml}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style='padding: 30px; text-align: center;'>
                            <a href='{wishlistUrl}' 
                               style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;'>
                                Xem danh sách yêu thích
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style='background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;'>
                            <p style='margin: 0 0 10px 0; color: #666; font-size: 14px;'>
                                Đừng bỏ lỡ cơ hội sở hữu những cuốn sách yêu thích với giá ưu đãi!
                            </p>
                            <p style='margin: 0; color: #999; font-size: 12px;'>
                                © 2025 VieBook. Mọi quyền được bảo lưu.<br>
                                <a href='{homeUrl}' style='color: #667eea; text-decoration: none;'>Truy cập VieBook</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

            await SendEmailAsync(user.Email, subject, body);
        }
    }
}
