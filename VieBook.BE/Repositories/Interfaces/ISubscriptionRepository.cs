using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface ISubscriptionRepository
    {
        Task<Subscription?> GetActiveSubscriptionByUserIdAsync(int userId);
        Task UpdateSubscriptionAsync(Subscription subscription);
        Task<Subscription?> GetSubscriptionByIdAsync(long subscriptionId);
    }
}

