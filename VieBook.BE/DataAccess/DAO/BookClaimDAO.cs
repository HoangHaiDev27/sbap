using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class BookClaimDAO
    {
        private readonly VieBookContext _context;

        public BookClaimDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<BookClaim?> GetByIdAsync(long claimId)
        {
            return await _context.BookClaims
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Owner)
                        .ThenInclude(o => o.UserProfile)
                .Include(bc => bc.Chapter)
                .Include(bc => bc.ChapterAudio)
                .Include(bc => bc.Customer)
                    .ThenInclude(c => c.UserProfile)
                .Include(bc => bc.ProcessedByNavigation)
                    .ThenInclude(p => p.UserProfile)
                .FirstOrDefaultAsync(bc => bc.ClaimId == claimId);
        }

        public async Task<List<BookClaim>> GetByBookOfferIdAsync(long bookOfferId)
        {
            return await _context.BookClaims
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(bc => bc.Chapter)
                .Include(bc => bc.ChapterAudio)
                .Include(bc => bc.Customer)
                    .ThenInclude(c => c.UserProfile)
                .Where(bc => bc.BookOfferId == bookOfferId)
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<BookClaim>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.BookClaims
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Owner)
                        .ThenInclude(o => o.UserProfile)
                .Include(bc => bc.Chapter)
                .Include(bc => bc.ChapterAudio)
                .Where(bc => bc.CustomerId == customerId)
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<BookClaim>> GetByStatusAsync(string status)
        {
            return await _context.BookClaims
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(bc => bc.BookOffer)
                    .ThenInclude(bo => bo.Owner)
                        .ThenInclude(o => o.UserProfile)
                .Include(bc => bc.Chapter)
                .Include(bc => bc.ChapterAudio)
                .Include(bc => bc.Customer)
                    .ThenInclude(c => c.UserProfile)
                .Where(bc => bc.Status == status)
                .OrderByDescending(bc => bc.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> HasUserClaimedAsync(long bookOfferId, int customerId)
        {
            return await _context.BookClaims
                .AnyAsync(bc => bc.BookOfferId == bookOfferId && bc.CustomerId == customerId);
        }

        public async Task<BookClaim> CreateAsync(BookClaim bookClaim)
        {
            _context.BookClaims.Add(bookClaim);
            await _context.SaveChangesAsync();
            return bookClaim;
        }

        public async Task<BookClaim> UpdateAsync(BookClaim bookClaim)
        {
            _context.BookClaims.Update(bookClaim);
            await _context.SaveChangesAsync();
            return bookClaim;
        }

        public async Task<bool> DeleteAsync(long claimId)
        {
            var bookClaim = await _context.BookClaims.FindAsync(claimId);
            if (bookClaim == null)
                return false;

            _context.BookClaims.Remove(bookClaim);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetPendingCountByOfferAsync(long bookOfferId)
        {
            return await _context.BookClaims
                .CountAsync(bc => bc.BookOfferId == bookOfferId && bc.Status == "Pending");
        }
    }
}

