using BusinessObject.Dtos;
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

        public async Task<List<int>> GetActiveUserIdsSinceAsync(DateTime cutoffDate)
        {
            return await _orderItemDAO.GetActiveUserIdsSinceAsync(cutoffDate);
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

        // Chapter Purchase Methods
        public async Task<OrderItem> CreateOrderItemAsync(OrderItem orderItem)
        {
            return await _orderItemDAO.CreateOrderItemAsync(orderItem);
        }

        public async Task CreateOrderItemsAsync(List<OrderItem> orderItems)
        {
            await _orderItemDAO.CreateOrderItemsAsync(orderItems);
        }

        public async Task<bool> CheckChapterOwnershipAsync(int userId, int chapterId)
        {
            return await _orderItemDAO.CheckChapterOwnershipAsync(userId, chapterId);
        }

        public async Task<bool> CheckChapterSoftOwnershipAsync(int userId, int chapterId)
        {
            return await _orderItemDAO.CheckChapterSoftOwnershipAsync(userId, chapterId);
        }

        public async Task<bool> CheckChapterAudioOwnershipAsync(int userId, int chapterId)
        {
            return await _orderItemDAO.CheckChapterAudioOwnershipAsync(userId, chapterId);
        }

        public async Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId)
        {
            return await _orderItemDAO.GetUserPurchasedChaptersAsync(userId);
        }

        public async Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId)
        {
            return await _orderItemDAO.GetUserPurchasedBooksAsync(userId);
        }
    }
}
