using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess
{
    public class ChapterDAO
    {
        private readonly VieBookContext _context;

        public ChapterDAO(VieBookContext context)
        {
            _context = context;
        }

        // Lấy tất cả chapter
        public async Task<List<Chapter>> GetAllAsync()
        {
            return await _context.Chapters
                                 .Include(c => c.Book)
                                 .Include(c => c.BookmarkChapterListens)
                                 .Include(c => c.BookmarkChapterReads)
                                 .Include(c => c.OrderItems)
                                 .ToListAsync();
        }

        // Lấy chapter theo Id
        public async Task<Chapter?> GetByIdAsync(int chapterId)
        {
            return await _context.Chapters
                                 .Include(c => c.Book)
                                 .Include(c => c.BookmarkChapterListens)
                                 .Include(c => c.BookmarkChapterReads)
                                 .Include(c => c.OrderItems)
                                 .FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        }

        // Thêm chapter mới
        public async Task InsertAsync(Chapter chapter)
        {
            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();
        }

        // Cập nhật chapter
        public async Task UpdateAsync(Chapter chapter)
        {
            _context.Chapters.Update(chapter);
            await _context.SaveChangesAsync();
        }

        // Xóa chapter
        public async Task DeleteAsync(int chapterId)
        {
            var chapter = await _context.Chapters.FindAsync(chapterId);
            if (chapter != null)
            {
                chapter.Status = "InActive";
                _context.Chapters.Update(chapter);
                await _context.SaveChangesAsync();
            }
        }

        // Tăng số lượt xem chapter
        public async Task IncrementViewAsync(int chapterId)
        {
            var chapter = await _context.Chapters.FindAsync(chapterId);
            if (chapter != null)
            {
                chapter.ChapterView++;
                await _context.SaveChangesAsync();
            }
        }

        // Lấy danh sách chapter theo BookId (chỉ lấy Active)
        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
        {
            return await _context.Chapters
                                 .Where(c => c.BookId == bookId)
                                 .Include(c => c.ChapterAudios)
                                 .Include(c => c.Book)
                                 .OrderBy(c => c.ChapterId)
                                 .ToListAsync();
        }

        // Cập nhật audio url và duration
        public async Task UpdateAudioAsync(int chapterId, string audioUrl, int durationSec, decimal? priceSoft = null, string? storageMeta = null)
        {
            var chapter = await _context.Chapters.FindAsync(chapterId);
            if (chapter != null)
            {
                chapter.ChapterAudioUrl = audioUrl;
                chapter.DurationSec = durationSec;
                chapter.PriceSoft = priceSoft;
                chapter.StorageMeta = storageMeta;
                await _context.SaveChangesAsync();
            }
        }

        // Kiểm tra chapter có tồn tại không (chỉ Active)
        public async Task<bool> CheckChapterExistsAsync(int chapterId)
        {
            return await _context.Chapters.AnyAsync(c => c.ChapterId == chapterId && c.Status == "Active");
        }
    }
}
