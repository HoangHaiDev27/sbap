using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly SubscriptionDAO _subscriptionDao;

        public SubscriptionRepository(SubscriptionDAO subscriptionDao)
        {
            _subscriptionDao = subscriptionDao;
        }

        public async Task<Subscription?> GetActiveSubscriptionByUserIdAsync(int userId)
        {
            return await _subscriptionDao.GetActiveSubscriptionByUserIdAsync(userId);
        }

        public async Task UpdateSubscriptionAsync(Subscription subscription)
        {
            await _subscriptionDao.UpdateSubscriptionAsync(subscription);
        }

        public async Task<Subscription?> GetSubscriptionByIdAsync(long subscriptionId)
        {
            return await _subscriptionDao.GetSubscriptionByIdAsync(subscriptionId);
        }
    }
}

