using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IChapterPurchaseService
    {
        Task<ChapterPurchaseResponseDTO> PurchaseChaptersAsync(int userId, ChapterPurchaseRequestDTO request);
        Task<bool> CheckChapterOwnershipAsync(int userId, int chapterId);
        Task<List<OrderItemDTO>> GetUserPurchasedChaptersAsync(int userId);
        Task<List<UserPurchasedBooksDTO>> GetUserPurchasedBooksAsync(int userId);
    }
}
