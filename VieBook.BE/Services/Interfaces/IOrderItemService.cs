using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IOrderItemService
    {
        Task<IEnumerable<PurchasedBookDTO>> GetPurchasedBooksAsync(int userId, int page, int pageSize, string timeFilter, string sortBy);
        Task<PurchasedBookDTO?> GetOrderItemByIdAsync(long orderItemId);
        Task<IEnumerable<object>> GetPurchasedChaptersByBookAsync(int userId, int bookId);
    }
}
