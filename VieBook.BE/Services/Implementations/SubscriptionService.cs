using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepository _subscriptionRepository;

        public SubscriptionService(ISubscriptionRepository subscriptionRepository)
        {
            _subscriptionRepository = subscriptionRepository;
        }

        public async Task<Subscription?> GetActiveSubscriptionByUserIdAsync(int userId)
        {
            return await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId);
        }

        public async Task UpdateSubscriptionAsync(Subscription subscription)
        {
            await _subscriptionRepository.UpdateSubscriptionAsync(subscription);
        }

        public async Task<Subscription?> GetSubscriptionByIdAsync(long subscriptionId)
        {
            return await _subscriptionRepository.GetSubscriptionByIdAsync(subscriptionId);
        }

        public async Task<bool> CanCreateAudioAsync(int userId, int characterCount)
        {
            var subscription = await GetActiveSubscriptionByUserIdAsync(userId);
            
            if (subscription == null)
                return false;

            var now = DateTime.UtcNow;
            
            // Kiểm tra ngày hiện tại có nhỏ hơn EndAt không
            if (now >= subscription.EndAt)
                return false;

            // Kiểm tra RemainingConversions > 0
            if (subscription.RemainingConversions <= 0)
                return false;

            // Kiểm tra có đủ conversions không
            int requiredConversions = characterCount > 10000 ? 2 : 1;
            if (subscription.RemainingConversions < requiredConversions)
                return false;

            return true;
        }

        public async Task DeductConversionAsync(int userId, int characterCount)
        {
            var subscription = await GetActiveSubscriptionByUserIdAsync(userId);
            
            if (subscription == null)
                throw new Exception("No active subscription found");

            // Nếu số lượng ký tự > 10000 thì trừ 2, còn lại trừ 1
            int deduction = characterCount > 10000 ? 2 : 1;
            
            subscription.RemainingConversions -= deduction;
            
            await _subscriptionRepository.UpdateSubscriptionAsync(subscription);
        }
    }
}

