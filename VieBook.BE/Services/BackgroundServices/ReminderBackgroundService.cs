using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Services.Interfaces;

namespace Services.BackgroundServices
{
    public class ReminderBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReminderBackgroundService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromMinutes(5); // Chạy mỗi 5 phút

        public ReminderBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<ReminderBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _logger.LogInformation("🔧 ReminderBackgroundService constructor called");
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Reminder Background Service started at {time}", DateTimeOffset.Now);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("⏰ Background service running at {time}", DateTimeOffset.Now);
                    
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                        await emailService.ProcessAllRemindersAsync();
                    }

                    _logger.LogInformation("✅ Reminder background service executed successfully at {time}", DateTimeOffset.Now);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error occurred in reminder background service at {time}", DateTimeOffset.Now);
                }

                _logger.LogInformation("⏳ Waiting {period} minutes for next execution...", _period.TotalMinutes);
                await Task.Delay(_period, stoppingToken);
            }
        }
    }
}
