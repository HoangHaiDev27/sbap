using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class BookOfferDAO
    {
        private readonly VieBookContext _context;

        public BookOfferDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<BookOffer?> GetByIdAsync(long bookOfferId)
        {
            return await _context.BookOffers
                .Include(bo => bo.Book)
                    .ThenInclude(b => b.Categories)
                .Include(bo => bo.Chapter)
                .Include(bo => bo.ChapterAudio)
                .Include(bo => bo.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(bo => bo.Post)
                .Include(bo => bo.BookClaims)
                .FirstOrDefaultAsync(bo => bo.BookOfferId == bookOfferId);
        }

        public async Task<BookOffer?> GetByPostIdAsync(long postId)
        {
            return await _context.BookOffers
                .Include(bo => bo.Book)
                    .ThenInclude(b => b.Categories)
                .Include(bo => bo.Chapter)
                .Include(bo => bo.ChapterAudio)
                .Include(bo => bo.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(bo => bo.Post)
                .Include(bo => bo.BookClaims)
                .FirstOrDefaultAsync(bo => bo.PostId == postId);
        }

        public async Task<List<BookOffer>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.BookOffers
                .Include(bo => bo.Book)
                    .ThenInclude(b => b.Categories)
                .Include(bo => bo.Chapter)
                .Include(bo => bo.ChapterAudio)
                .Include(bo => bo.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(bo => bo.Post)
                .Where(bo => bo.OwnerId == ownerId)
                .OrderByDescending(bo => bo.StartAt)
                .ToListAsync();
        }

        public async Task<List<BookOffer>> GetActiveOffersAsync()
        {
            return await _context.BookOffers
                .Include(bo => bo.Book)
                    .ThenInclude(b => b.Categories)
                .Include(bo => bo.Chapter)
                .Include(bo => bo.ChapterAudio)
                .Include(bo => bo.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(bo => bo.Post)
                .Where(bo => bo.Status == "Active" 
                    && (bo.EndAt == null || bo.EndAt > DateTime.UtcNow))
                .OrderByDescending(bo => bo.StartAt)
                .ToListAsync();
        }

        public async Task<BookOffer> CreateAsync(BookOffer bookOffer)
        {
            _context.BookOffers.Add(bookOffer);
            await _context.SaveChangesAsync();
            return bookOffer;
        }

        public async Task<BookOffer> UpdateAsync(BookOffer bookOffer)
        {
            _context.BookOffers.Update(bookOffer);
            await _context.SaveChangesAsync();
            return bookOffer;
        }

        public async Task<bool> DeleteAsync(long bookOfferId)
        {
            var bookOffer = await _context.BookOffers.FindAsync(bookOfferId);
            if (bookOffer == null)
                return false;

            _context.BookOffers.Remove(bookOffer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetClaimCountAsync(long bookOfferId)
        {
            return await _context.BookClaims
                .CountAsync(bc => bc.BookOfferId == bookOfferId);
        }

        public async Task<int> GetApprovedClaimCountAsync(long bookOfferId)
        {
            return await _context.BookClaims
                .CountAsync(bc => bc.BookOfferId == bookOfferId && bc.Status == "Approved");
        }
    }
}

