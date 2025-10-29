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

        public async Task<BusinessObject.Dtos.PromotionStatsDTO> GetStatsByOwnerAsync(int ownerId)
        {
            var now = DateTime.UtcNow;
            var promotions = await _context.Promotions
                .Include(p => p.Books)
                .Where(p => p.OwnerId == ownerId && p.IsActive)
                .ToListAsync();

            var active = promotions.Count(p => p.StartAt <= now && p.EndAt >= now);
            var upcoming = promotions.Count(p => p.StartAt > now);
            var expired = promotions.Count(p => p.EndAt < now);
            var totalBooksApplied = promotions.Sum(p => p.Books.Count);

            return new BusinessObject.Dtos.PromotionStatsDTO
            {
                ActiveCount = active,
                UpcomingCount = upcoming,
                ExpiredCount = expired,
                TotalPromotions = promotions.Count,
                TotalBooksApplied = totalBooksApplied,
                TotalUses = 0,
                TotalRevenue = 0
            };
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
                        .ThenInclude(c => c.ChapterAudios)
                .Where(p => p.OwnerId == ownerId && p.IsActive)
                .OrderDescending()
                .ToListAsync();
        }

        public async Task<Promotion> CreatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            // Validate: a book cannot have more than one active/overlapping promotion in the same time range
            var conflicts = await _context.Promotions
                .Include(p => p.Books)
                .Where(p => p.IsActive
                    && p.Books.Any(b => bookIds.Contains(b.BookId))
                    && p.StartAt <= promotion.EndAt
                    && p.EndAt >= promotion.StartAt)
                .ToListAsync();

            if (conflicts.Any())
            {
                var conflictDetails = conflicts
                    .SelectMany(p => p.Books
                        .Where(b => bookIds.Contains(b.BookId))
                        .Select(b => new { b.BookId, b.Title, p.PromotionName, p.StartAt, p.EndAt }))
                    .ToList();

                var message = string.Join("; ", conflictDetails.Select(c => $"{c.Title} đã có promotion '{c.PromotionName}' từ {c.StartAt:dd/MM/yyyy} đến {c.EndAt:dd/MM/yyyy}"));
                throw new InvalidOperationException(message);
            }

            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .ToListAsync();

            promotion.Books = books;
            promotion.IsActive = true;

            _context.Promotions.Add(promotion);
            await _context.SaveChangesAsync();

            return promotion;
        }

        public async Task<Promotion?> GetPromotionByIdAsync(int promotionId)
        {
            return await _context.Promotions
                .Include(p => p.Books)
                    .ThenInclude(b => b.Chapters)
                        .ThenInclude(c => c.ChapterAudios)
                .Include(p => p.Books)
                    .ThenInclude(b => b.Categories)
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId && p.IsActive);
        }

        public async Task<Promotion> UpdatePromotionAsync(Promotion promotion, List<int> bookIds)
        {
            // Validate overlap excluding the current promotion
            var conflicts = await _context.Promotions
                .Include(p => p.Books)
                .Where(p => p.IsActive
                    && p.PromotionId != promotion.PromotionId
                    && p.Books.Any(b => bookIds.Contains(b.BookId))
                    && p.StartAt <= promotion.EndAt
                    && p.EndAt >= promotion.StartAt)
                .ToListAsync();

            if (conflicts.Any())
            {
                var conflictDetails = conflicts
                    .SelectMany(p => p.Books
                        .Where(b => bookIds.Contains(b.BookId))
                        .Select(b => new { b.BookId, b.Title, p.PromotionName, p.StartAt, p.EndAt }))
                    .ToList();

                var message = string.Join("; ", conflictDetails.Select(c => $"{c.Title} đã có promotion '{c.PromotionName}' từ {c.StartAt:dd/MM/yyyy} đến {c.EndAt:dd/MM/yyyy}"));
                throw new InvalidOperationException(message);
            }

            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .ToListAsync();

            promotion.Books.Clear();
            promotion.Books = books;

            _context.Promotions.Update(promotion);
            await _context.SaveChangesAsync();

            return promotion;
        }

        public async Task<bool> DeletePromotionAsync(int promotionId, int ownerId)
        {
            var promo = await _context.Promotions
                .FirstOrDefaultAsync(p => p.PromotionId == promotionId && p.OwnerId == ownerId);

            if (promo == null) return false;

            promo.IsActive = false; // đánh dấu đã xoá
            _context.Promotions.Update(promo);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
