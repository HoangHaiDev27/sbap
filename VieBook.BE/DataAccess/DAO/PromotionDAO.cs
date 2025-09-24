using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class PromotionDAO
    {
        private readonly VieBookContext _context;

        public PromotionDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<List<Promotion>> GetPromotionsByOwnerAsync(int ownerId)
        {
            return await _context.Promotions
                .Include(p => p.Books)
                    .ThenInclude(b => b.Categories)
                .Include(p => p.Books)
                    .ThenInclude(b => b.Owner)
                        .ThenInclude(o => o.UserProfile)
                .Include(p => p.Books)
                    .ThenInclude(b => b.Chapters)
                .Where(p => p.OwnerId == ownerId)
                .OrderDescending()
                .ToListAsync();
        }
        public async Task<Promotion> CreatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .ToListAsync();

            promotion.Books = books;

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();

            return promotion;
        }
        public async Task<Promotion?> GetPromotionByIdAsync(int promotionId)
        {
            return await _context.Promotions
                .Include(p => p.Books)
                .ThenInclude(b => b.Chapters)
                .Include(p => p.Books)
                .ThenInclude(b => b.Categories)
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId);
        }

        public async Task<Promotion> UpdatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .ToListAsync();

            promotion.Books.Clear();
            promotion.Books = books;

            _context.Promotions.Update(promotion);
            await _context.SaveChangesAsync();

            return promotion;
        }


    }
}
