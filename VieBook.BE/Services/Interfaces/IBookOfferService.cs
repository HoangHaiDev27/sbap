using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IBookOfferService
    {
        Task<BookOfferDTO?> GetByIdAsync(long bookOfferId);
        Task<BookOfferDTO?> GetByPostIdAsync(long postId);
        Task<List<BookOfferDTO>> GetByOwnerIdAsync(int ownerId);
        Task<List<BookOfferDTO>> GetActiveOffersAsync();
        Task<BookOfferDTO> CreateAsync(CreateBookOfferDTO createDto, int ownerId);
        Task<BookOfferDTO> UpdateAsync(long bookOfferId, UpdateBookOfferDTO updateDto, int ownerId);
        Task<bool> DeleteAsync(long bookOfferId, int ownerId);
        Task<int> GetClaimCountForOfferAsync(long bookOfferId);
        Task<int> GetApprovedClaimCountForOfferAsync(long bookOfferId);
    }
}

