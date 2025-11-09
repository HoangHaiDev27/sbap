using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IBookOfferRepository
    {
        Task<BookOffer?> GetByIdAsync(long bookOfferId);
        Task<BookOffer?> GetByPostIdAsync(long postId);
        Task<List<BookOffer>> GetByOwnerIdAsync(int ownerId);
        Task<List<BookOffer>> GetActiveOffersAsync();
        Task<BookOffer> CreateAsync(BookOffer bookOffer);
        Task<BookOffer> UpdateAsync(BookOffer bookOffer);
        Task<bool> DeleteAsync(long bookOfferId);
        Task<int> GetClaimCountAsync(long bookOfferId);
        Task<int> GetApprovedClaimCountAsync(long bookOfferId);
    }
}

