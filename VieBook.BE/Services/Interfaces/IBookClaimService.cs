using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces
{
    public interface IBookClaimService
    {
        Task<BookClaimDTO?> GetByIdAsync(long claimId);
        Task<List<BookClaimDTO>> GetByBookOfferIdAsync(long bookOfferId);
        Task<List<BookClaimDTO>> GetByCustomerIdAsync(int customerId);
        Task<List<BookClaimDTO>> GetByStatusAsync(string status);
        Task<BookClaimDTO> CreateAsync(CreateBookClaimDTO createDto, int customerId);
        Task<BookClaimDTO> UpdateAsync(long claimId, UpdateBookClaimDTO updateDto, int? processedBy);
        Task<bool> DeleteAsync(long claimId, int customerId);
        Task<bool> ApproveClaimAsync(long claimId, int? processedBy);
        Task<bool> HasUserClaimedAsync(long bookOfferId, int customerId);
    }
}

