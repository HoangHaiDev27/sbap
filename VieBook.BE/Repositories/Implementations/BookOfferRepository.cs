using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class BookOfferRepository : IBookOfferRepository
    {
        private readonly BookOfferDAO _bookOfferDAO;

        public BookOfferRepository(BookOfferDAO bookOfferDAO)
        {
            _bookOfferDAO = bookOfferDAO;
        }

        public Task<BookOffer?> GetByIdAsync(long bookOfferId)
            => _bookOfferDAO.GetByIdAsync(bookOfferId);

        public Task<BookOffer?> GetByPostIdAsync(long postId)
            => _bookOfferDAO.GetByPostIdAsync(postId);

        public Task<List<BookOffer>> GetByOwnerIdAsync(int ownerId)
            => _bookOfferDAO.GetByOwnerIdAsync(ownerId);

        public Task<List<BookOffer>> GetActiveOffersAsync()
            => _bookOfferDAO.GetActiveOffersAsync();

        public Task<BookOffer> CreateAsync(BookOffer bookOffer)
            => _bookOfferDAO.CreateAsync(bookOffer);

        public Task<BookOffer> UpdateAsync(BookOffer bookOffer)
            => _bookOfferDAO.UpdateAsync(bookOffer);

        public Task<bool> DeleteAsync(long bookOfferId)
            => _bookOfferDAO.DeleteAsync(bookOfferId);

        public Task<int> GetClaimCountAsync(long bookOfferId)
            => _bookOfferDAO.GetClaimCountAsync(bookOfferId);

        public Task<int> GetApprovedClaimCountAsync(long bookOfferId)
            => _bookOfferDAO.GetApprovedClaimCountAsync(bookOfferId);
    }
}

