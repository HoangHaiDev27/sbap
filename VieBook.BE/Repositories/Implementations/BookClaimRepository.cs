using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class BookClaimRepository : IBookClaimRepository
    {
        private readonly BookClaimDAO _bookClaimDAO;

        public BookClaimRepository(BookClaimDAO bookClaimDAO)
        {
            _bookClaimDAO = bookClaimDAO;
        }

        public Task<BookClaim?> GetByIdAsync(long claimId)
            => _bookClaimDAO.GetByIdAsync(claimId);

        public Task<List<BookClaim>> GetByBookOfferIdAsync(long bookOfferId)
            => _bookClaimDAO.GetByBookOfferIdAsync(bookOfferId);

        public Task<List<BookClaim>> GetByCustomerIdAsync(int customerId)
            => _bookClaimDAO.GetByCustomerIdAsync(customerId);

        public Task<List<BookClaim>> GetByStatusAsync(string status)
            => _bookClaimDAO.GetByStatusAsync(status);

        public Task<bool> HasUserClaimedAsync(long bookOfferId, int customerId)
            => _bookClaimDAO.HasUserClaimedAsync(bookOfferId, customerId);

        public Task<BookClaim> CreateAsync(BookClaim bookClaim)
            => _bookClaimDAO.CreateAsync(bookClaim);

        public Task<BookClaim> UpdateAsync(BookClaim bookClaim)
            => _bookClaimDAO.UpdateAsync(bookClaim);

        public Task<bool> DeleteAsync(long claimId)
            => _bookClaimDAO.DeleteAsync(claimId);

        public Task<int> GetPendingCountByOfferAsync(long bookOfferId)
            => _bookClaimDAO.GetPendingCountByOfferAsync(bookOfferId);
    }
}

