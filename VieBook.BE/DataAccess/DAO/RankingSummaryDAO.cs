using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class RankingSummaryDAO
    {
        private readonly VieBookContext _context;
        public RankingSummaryDAO(VieBookContext context)
        {
            _context = context;
        }
     
        // Phổ biến
        public async Task<int> CountPopularBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.TotalView > 85)
                .CountAsync();
        }

        // Đánh giá cao
        public async Task<int> CountTopRatedBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.BookReviews.Any())
                .CountAsync(b => b.BookReviews.Average(r => r.Rating) >= 4.5);
        }

        // Mới nhất
        public async Task<int> CountNewReleasesAsync()
        {
            var last30Days = DateTime.UtcNow.AddDays(-30);
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= last30Days)
                .CountAsync();
        }

        // Hot trend
        public async Task<int> CountTrendingBooksAsync()
        {
            var last7Days = DateTime.UtcNow.AddDays(-7);
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= last7Days && b.TotalView > 100)
                .CountAsync();
        }

        // Top 5 phổ biến
        public async Task<List<Book>> GetTopPopularBooksAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .OrderByDescending(b => b.TotalView)
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Categories)
                .ToListAsync();
        }

        // Top 5 đánh giá cao
        public async Task<List<Book>> GetTopRatedBooksAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.BookReviews.Any())
                .OrderByDescending(b => b.BookReviews.Average(r => r.Rating))
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Categories)
                .ToListAsync();
        }

        // Top 5 mới phát hành
        public async Task<List<Book>> GetNewReleasesAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .OrderByDescending(b => b.CreatedAt)
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Categories)
                .ToListAsync();
        }

        // Top 5 hot trend
        public async Task<List<Book>> GetTrendingBooksAsync(int top = 5)
        {
            var last7Days = DateTime.UtcNow.AddDays(-7);
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= last7Days && b.TotalView > 85)
                .OrderByDescending(b => b.TotalView)
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Categories)
                .ToListAsync();
        }
    }
}