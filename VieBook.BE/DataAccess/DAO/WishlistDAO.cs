using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class WishlistDAO
    {
        private readonly VieBookContext _context;

        public WishlistDAO(VieBookContext context)
        {
            _context = context;
        }

        public Task<bool> IsInWishlistAsync(int userId, int bookId)
        {
            return _context.Wishlists.AnyAsync(w => w.UserId == userId && w.BookId == bookId);
        }

        public async Task<Wishlist> AddAsync(int userId, int bookId)
        {
            var existing = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
            if (existing != null)
            {
                return existing;
            }

            var entity = new Wishlist
            {
                UserId = userId,
                BookId = bookId
            };
            _context.Wishlists.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> RemoveAsync(int userId, int bookId)
        {
            var existing = await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);
            if (existing == null)
            {
                return false;
            }
            _context.Wishlists.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<WishlistBookDTO>> GetUserWishlistBooksAsync(int userId)
        {
            var wishlistBooks = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .Select(w => new WishlistBookDTO
                {
                    BookId = w.Book.BookId,
                    OwnerId = w.Book.OwnerId,
                    Title = w.Book.Title,
                    Description = w.Book.Description,
                    CoverUrl = w.Book.CoverUrl,
                    Isbn = w.Book.Isbn,
                    Language = w.Book.Language,
                    Status = w.Book.Status,
                    TotalView = w.Book.TotalView,
                    CreatedAt = w.Book.CreatedAt,
                    UpdatedAt = w.Book.UpdatedAt,
                    Author = w.Book.Author,
                    BookReviews = w.Book.BookReviews.Select(br => new BookReviewDTO
                    {
                        ReviewId = br.ReviewId,
                        BookId = br.BookId,
                        UserId = br.UserId,
                        Rating = br.Rating,
                        Comment = br.Comment,
                        CreatedAt = br.CreatedAt
                    }).ToList(),
                    Chapters = w.Book.Chapters.Select(c => new ChapterDTO
                    {
                        ChapterId = c.ChapterId,
                        ChapterTitle = c.ChapterTitle,
                        ChapterView = c.ChapterView,
                        ChapterSoftUrl = c.ChapterSoftUrl,
                        ChapterAudioUrl = c.ChapterAudioUrl,
                        DurationSec = c.DurationSec ?? 0,
                        PriceSoft = c.PriceSoft ?? 0,
                        UploadedAt = c.UploadedAt
                    }).ToList(),
                    Categories = w.Book.Categories.Select(cat => new CategoryDTO
                    {
                        CategoryId = cat.CategoryId,
                        Name = cat.Name,
                        Type = cat.Type,
                        ParentId = cat.ParentId,
                        IsActive = cat.IsActive
                    }).ToList(),
                    Owner = w.Book.Owner != null ? new UserDTO
                    {
                        UserId = w.Book.Owner.UserId,
                        Email = w.Book.Owner.Email,
                        Status = w.Book.Owner.Status,
                        CreatedAt = w.Book.Owner.CreatedAt,
                        LastLoginAt = w.Book.Owner.LastLoginAt,
                        Wallet = w.Book.Owner.Wallet
                    } : null
                })
                .AsNoTracking()
                .ToListAsync();

            // Calculate derived fields
            foreach (var book in wishlistBooks)
            {
                // Calculate average rating
                if (book.BookReviews.Any())
                {
                    book.AverageRating = book.BookReviews.Average(br => br.Rating);
                }
                else
                {
                    book.AverageRating = 0;
                }

                // Calculate total duration
                book.TotalDurationMinutes = book.Chapters.Sum(c => c.DurationSec) / 60;
            }

            return wishlistBooks;
        }
    }
}


