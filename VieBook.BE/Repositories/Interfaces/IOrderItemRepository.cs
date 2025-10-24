using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IOrderItemRepository
    {
        Task<IEnumerable<OrderItem>> GetPurchasedBooksByUserIdAsync(int userId);
        Task<OrderItem?> GetOrderItemByIdAsync(long orderItemId);
        Task<IEnumerable<OrderItem>> GetOwnerOrderItemsAsync(int ownerId);
        Task<object> GetOwnerOrderStatsAsync(int ownerId);
    }
}
