using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class SubscriptionDAO
    {
        private readonly VieBookContext _context;

        public SubscriptionDAO(VieBookContext context)
        {
            _context = context;
        }

        // Lấy subscription active của user
        public async Task<Subscription?> GetActiveSubscriptionByUserIdAsync(int userId)
        {
            var now = DateTime.UtcNow;
            
            var subscription = await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId 
                    && s.Status.Trim() == "Active" 
                    && s.EndAt > now)
                .OrderByDescending(s => s.EndAt)
                .FirstOrDefaultAsync();
            
            return subscription;
        }

        // Cập nhật subscription
        public async Task UpdateSubscriptionAsync(Subscription subscription)
        {
            _context.Subscriptions.Update(subscription);
            await _context.SaveChangesAsync();
        }

        // Lấy subscription theo ID
        public async Task<Subscription?> GetSubscriptionByIdAsync(long subscriptionId)
        {
            return await _context.Subscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.SubscriptionId == subscriptionId);
        }

        // Lấy tất cả subscriptions của user (bao gồm lịch sử mua gói)
        public async Task<List<Subscription>> GetSubscriptionsByUserIdAsync(int userId)
        {
            return await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }
    }
}

