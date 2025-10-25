using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface ISubscriptionService
    {
        Task<Subscription?> GetActiveSubscriptionByUserIdAsync(int userId);
        Task UpdateSubscriptionAsync(Subscription subscription);
        Task<Subscription?> GetSubscriptionByIdAsync(long subscriptionId);
        Task<bool> CanCreateAudioAsync(int userId, int characterCount);
        Task DeductConversionAsync(int userId, int characterCount);
    }
}

