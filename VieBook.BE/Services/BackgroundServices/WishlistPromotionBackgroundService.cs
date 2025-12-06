using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Services.Interfaces;
using Services.Options;

namespace Services.BackgroundServices
{
    /// <summary>
    /// Background service chạy mỗi ngày để kiểm tra promotions bắt đầu hôm nay
    /// và gửi email cho users có sách trong wishlist
    /// </summary>
    public class WishlistPromotionBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WishlistPromotionBackgroundService> _logger;
        private readonly FrontendOptions _frontendOptions;
        
        // Chạy mỗi ngày 1 lần (24 giờ)
        private readonly TimeSpan _period = TimeSpan.FromHours(24);
        
        // Giờ chạy job (7:00 sáng UTC+7 = 0:00 UTC)
        private readonly int _targetHourUtc = 0; // 7:00 AM Vietnam = 00:00 UTC

        public WishlistPromotionBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<WishlistPromotionBackgroundService> logger,
            IOptions<FrontendOptions> frontendOptions)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _frontendOptions = frontendOptions.Value;
            _logger.LogInformation("🔧 WishlistPromotionBackgroundService constructor called");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Wishlist Promotion Background Service started at {time}", DateTimeOffset.Now);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Tính thời gian chờ đến lần chạy tiếp theo (7:00 AM Vietnam mỗi ngày)
                    var now = DateTime.UtcNow;
                    var nextRun = CalculateNextRunTime(now);
                    var delay = nextRun - now;

                    if (delay > TimeSpan.Zero)
                    {
                        _logger.LogInformation("⏳ Waiting until {nextRun} (UTC) for next execution. Delay: {delay}", 
                            nextRun, delay);
                        await Task.Delay(delay, stoppingToken);
                    }

                    _logger.LogInformation("⏰ Wishlist Promotion job running at {time}", DateTimeOffset.Now);

                    // Lấy Frontend URL từ FrontendOptions (được configure từ ApiConfiguration)
                    var frontendUrl = _frontendOptions.BaseUrl;
                    
                    if (string.IsNullOrEmpty(frontendUrl))
                    {
                        throw new InvalidOperationException("FrontendOptions.BaseUrl is not configured");
                    }

                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                        await emailService.ProcessWishlistPromotionsAsync(frontendUrl);
                    }

                    _logger.LogInformation("✅ Wishlist Promotion job executed successfully at {time}", DateTimeOffset.Now);
                }
                catch (OperationCanceledException)
                {
                    // Service is stopping
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error occurred in Wishlist Promotion background service at {time}", DateTimeOffset.Now);
                    
                    // Wait a bit before retrying to avoid tight loop on persistent errors
                    await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
                }
            }

            _logger.LogInformation("🛑 Wishlist Promotion Background Service stopped");
        }

        /// <summary>
        /// Tính thời gian chạy tiếp theo (7:00 AM Vietnam = 00:00 UTC mỗi ngày)
        /// </summary>
        private DateTime CalculateNextRunTime(DateTime utcNow)
        {
            // Tạo thời điểm target cho hôm nay
            var todayTarget = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, _targetHourUtc, 0, 0, DateTimeKind.Utc);

            // Nếu đã qua giờ target hôm nay, chuyển sang ngày mai
            if (utcNow >= todayTarget)
            {
                return todayTarget.AddDays(1);
            }

            return todayTarget;
        }
    }
}

