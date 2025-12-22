using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class RankingSummaryDAO
    {
        private readonly VieBookContext _context;
        private readonly DateTime _last7Days;

        public RankingSummaryDAO(VieBookContext context)
        {
            _context = context;
            _last7Days = DateTime.UtcNow.AddDays(-14);
        }

        // ==================== PHỔ BIẾN ====================
        // Tổng view của các chương trong 7 ngày gần nhất > 85
        public async Task<int> CountPopularBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .Where(b => b.Chapters
                    .Sum(c => (int?)c.ChapterView) >= 85)
                .CountAsync();
        }

        // ==================== ĐÁNH GIÁ CAO ====================
        // Sách có review trong 7 ngày gần nhất, rating trung bình >= 4.5
        public async Task<int> CountTopRatedBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved")
                .Where(b => b.BookReviews.Any(r => r.CreatedAt >= _last7Days))
                .Where(b => b.BookReviews
                    .Where(r => r.CreatedAt >= _last7Days)
                    .Average(r => (double?)r.Rating) >= 4.5)
                .CountAsync();
        }

        // ==================== MỚI PHÁT HÀNH ====================
        // Sách được tạo trong 7 ngày gần nhất
        public async Task<int> CountNewReleasesAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .CountAsync();
        }

        // ==================== HOT TREND ====================
        // Sách có tổng view trong 7 ngày > 100, đánh giá >= 4.5 và được cập nhật gần đây
        public async Task<int> CountTrendingBooksAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .Where(b => b.Chapters
                    .Sum(c => (int?)c.ChapterView) > 100)
                .Where(b => b.BookReviews.Any()) 
                .Where(b => b.BookReviews.Average(r => (double?)r.Rating) >= 4.5)
                .CountAsync();
        }

                // ==================== TOP 5 PHỔ BIẾN ====================
        public async Task<List<Book>> GetTopPopularBooksAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Chapters) 
                .Where(b => b.Chapters.Sum(c => (int?)c.ChapterView) >= 85)
                .OrderByDescending(b => b.Chapters.Sum(c => (int?)c.ChapterView))
                .Take(top)
                .ToListAsync();
        }

        // ==================== TOP 5 ĐÁNH GIÁ CAO ====================
        public async Task<List<Book>> GetTopRatedBooksAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.BookReviews.Any(r => r.CreatedAt >= _last7Days))
                .OrderByDescending(b => b.BookReviews
                    .Where(r => r.CreatedAt >= _last7Days)
                    .Average(r => (double?)r.Rating >= 4.5 ? r.Rating : 0))
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Categories)
                .Include(b => b.Owner)
                .ToListAsync();
        }

        // ==================== TOP 5 MỚI PHÁT HÀNH ====================
        public async Task<List<Book>> GetNewReleasesAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .OrderByDescending(b => b.CreatedAt)
                .Take(top)
                .Include(b => b.BookReviews)
                .Include(b => b.Categories)
                .Include(b => b.Owner)
                .ToListAsync();
        }

        // ==================== TOP 5 TRENDING ====================
        public async Task<List<Book>> GetTrendingBooksAsync(int top = 5)
        {
            return await _context.Books
                .Where(b => b.Status == "Approved" && b.CreatedAt >= _last7Days)
                .Where(b => b.Chapters.Sum(c => (int?)c.ChapterView) > 100)
                .Where(b => b.BookReviews.Any())
                .Where(b => b.BookReviews.Average(r => (double?)r.Rating) > 4.5)
                .OrderByDescending(b => b.Chapters.Sum(c => (int?)c.ChapterView))
                .ThenByDescending(b => b.BookReviews.Average(r => (double?)r.Rating))
                .Take(top)
                .Include(b => b.Categories)
                .Include(b => b.BookReviews)
                .Include(b => b.Owner)
                .Include(b => b.Chapters)
                .ToListAsync();
        }

    }
}
