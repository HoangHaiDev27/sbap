using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IBookClaimRepository
    {
        Task<BookClaim?> GetByIdAsync(long claimId);
        Task<List<BookClaim>> GetByBookOfferIdAsync(long bookOfferId);
        Task<List<BookClaim>> GetByCustomerIdAsync(int customerId);
        Task<List<BookClaim>> GetByStatusAsync(string status);
        Task<bool> HasUserClaimedAsync(long bookOfferId, int customerId);
        Task<BookClaim> CreateAsync(BookClaim bookClaim);
        Task<BookClaim> UpdateAsync(BookClaim bookClaim);
        Task<bool> DeleteAsync(long claimId);
        Task<int> GetPendingCountByOfferAsync(long bookOfferId);
    }
}

