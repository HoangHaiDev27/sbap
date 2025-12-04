using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IOrderItemRepository
    {
        Task<IEnumerable<OrderItem>> GetPurchasedBooksByUserIdAsync(int userId);
        Task<OrderItem?> GetOrderItemByIdAsync(long orderItemId);
        Task<IEnumerable<OrderItem>> GetOwnerOrderItemsAsync(int ownerId);
        Task<object> GetOwnerOrderStatsAsync(int ownerId);

        // Chapter Purchase Methods
        Task<OrderItem> CreateOrderItemAsync(OrderItem orderItem);
        Task CreateOrderItemsAsync(List<OrderItem> orderItems);
        Task<bool> CheckChapterOwnershipAsync(int userId, int chapterId);
        Task<bool> CheckChapterSoftOwnershipAsync(int userId, int chapterId);
        Task<bool> CheckChapterAudioOwnershipAsync(int userId, int chapterId);
        Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId);
        Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId);
    }
}
