using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class OrderItemRepository : IOrderItemRepository
    {
        private readonly OrderItemDAO _orderItemDAO;

        public OrderItemRepository(OrderItemDAO orderItemDAO)
        {
            _orderItemDAO = orderItemDAO;
        }

        public async Task<IEnumerable<OrderItem>> GetPurchasedBooksByUserIdAsync(int userId)
        {
            return await _orderItemDAO.GetPurchasedBooksByUserIdAsync(userId);
        }

        public async Task<OrderItem?> GetOrderItemByIdAsync(long orderItemId)
        {
            return await _orderItemDAO.GetByIdAsync(orderItemId);
        }

        public async Task<IEnumerable<OrderItem>> GetOwnerOrderItemsAsync(int ownerId)
        {
            return await _orderItemDAO.GetOwnerOrderItemsAsync(ownerId);
        }

        public async Task<object> GetOwnerOrderStatsAsync(int ownerId)
        {
            return await _orderItemDAO.GetOwnerOrderStatsAsync(ownerId);
        }
    }
}
