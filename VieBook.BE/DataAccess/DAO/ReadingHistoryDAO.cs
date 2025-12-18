using BusinessObject.Models;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class ReadingHistoryDAO
    {
        private readonly VieBookContext _context;
        
        public ReadingHistoryDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<List<ReadingHistoryDTO>> GetReadingHistoryByUserIdAsync(int userId, ReadingHistoryFilterDTO? filter = null)
        {
            var query = _context.ReadingHistories
                .Include(rh => rh.Book)
                .Include(rh => rh.Chapter)
                .Where(rh => rh.UserId == userId);

            if (filter != null)
            {
                if (filter.BookId.HasValue)
                    query = query.Where(rh => rh.BookId == filter.BookId.Value);

                if (filter.ChapterId.HasValue)
                    query = query.Where(rh => rh.ChapterId == filter.ChapterId.Value);

                if (!string.IsNullOrEmpty(filter.ReadingType))
                    query = query.Where(rh => rh.ReadingType == filter.ReadingType);

                if (filter.FromDate.HasValue)
                    query = query.Where(rh => rh.LastReadAt >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(rh => rh.LastReadAt <= filter.ToDate.Value);
            }

            query = query.OrderByDescending(rh => rh.LastReadAt);

            if (filter != null && filter.PageSize > 0)
            {
                query = query.Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize);
            }

            var readingHistories = await query.ToListAsync();

            return readingHistories.Select(rh => new ReadingHistoryDTO
            {
                ReadingHistoryId = rh.ReadingHistoryId,
                UserId = rh.UserId,
                BookId = rh.BookId,
                ChapterId = rh.ChapterId,
                ReadingType = rh.ReadingType,
                AudioPosition = rh.AudioPosition,
                LastReadAt = rh.LastReadAt,
                BookTitle = rh.Book?.Title,
                ChapterTitle = rh.Chapter?.ChapterTitle,
                CoverUrl = rh.Book?.CoverUrl,
                Author = rh.Book?.Author
            }).ToList();
        }

        public async Task<ReadingHistoryDTO?> GetReadingHistoryByIdAsync(long readingHistoryId)
        {
            var readingHistory = await _context.ReadingHistories
                .Include(rh => rh.Book)
                .Include(rh => rh.Chapter)
                .FirstOrDefaultAsync(rh => rh.ReadingHistoryId == readingHistoryId);

            if (readingHistory == null) return null;

            return new ReadingHistoryDTO
            {
                ReadingHistoryId = readingHistory.ReadingHistoryId,
                UserId = readingHistory.UserId,
                BookId = readingHistory.BookId,
                ChapterId = readingHistory.ChapterId,
                ReadingType = readingHistory.ReadingType,
                AudioPosition = readingHistory.AudioPosition,
                LastReadAt = readingHistory.LastReadAt,
                BookTitle = readingHistory.Book?.Title,
                ChapterTitle = readingHistory.Chapter?.ChapterTitle,
                CoverUrl = readingHistory.Book?.CoverUrl,
                Author = readingHistory.Book?.Author
            };
        }

        public async Task<ReadingHistoryDTO?> GetCurrentReadingProgressAsync(int userId, int bookId, int? chapterId, string readingType)
        {
            // Kiểm tra theo userId + bookId + readingType (không phân biệt chapter)
            var query = _context.ReadingHistories
                .Include(rh => rh.Book)
                .Include(rh => rh.Chapter)
                .Where(rh => rh.UserId == userId && rh.BookId == bookId && rh.ReadingType == readingType);

            var readingHistory = await query
                .OrderByDescending(rh => rh.LastReadAt)
                .FirstOrDefaultAsync();

            if (readingHistory == null) return null;

            return new ReadingHistoryDTO
            {
                ReadingHistoryId = readingHistory.ReadingHistoryId,
                UserId = readingHistory.UserId,
                BookId = readingHistory.BookId,
                ChapterId = readingHistory.ChapterId,
                ReadingType = readingHistory.ReadingType,
                AudioPosition = readingHistory.AudioPosition,
                LastReadAt = readingHistory.LastReadAt,
                BookTitle = readingHistory.Book?.Title,
                ChapterTitle = readingHistory.Chapter?.ChapterTitle,
                CoverUrl = readingHistory.Book?.CoverUrl,
                Author = readingHistory.Book?.Author
            };
        }

        public async Task<long> CreateReadingHistoryAsync(CreateReadingHistoryDTO createDto, int userId)
        {
            var readingHistory = new ReadingHistory
            {
                UserId = userId,
                BookId = createDto.BookId,
                ChapterId = createDto.ChapterId,
                ReadingType = createDto.ReadingType,
                AudioPosition = createDto.AudioPosition,
                LastReadAt = DateTime.UtcNow
            };

            _context.ReadingHistories.Add(readingHistory);
            await _context.SaveChangesAsync();

            return readingHistory.ReadingHistoryId;
        }

        public async Task<bool> UpdateReadingHistoryAsync(UpdateReadingHistoryDTO updateDto)
        {
            var readingHistory = await _context.ReadingHistories
                .FirstOrDefaultAsync(rh => rh.ReadingHistoryId == updateDto.ReadingHistoryId);

            if (readingHistory == null) return false;

            // Cập nhật chapterId nếu có
            if (updateDto.ChapterId.HasValue)
            {
                readingHistory.ChapterId = updateDto.ChapterId.Value;
            }

            // Cập nhật audioPosition nếu có
            if (updateDto.AudioPosition.HasValue)
            {
                readingHistory.AudioPosition = updateDto.AudioPosition.Value;
            }

            readingHistory.LastReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteReadingHistoryAsync(long readingHistoryId)
        {
            var readingHistory = await _context.ReadingHistories
                .FirstOrDefaultAsync(rh => rh.ReadingHistoryId == readingHistoryId);

            if (readingHistory == null) return false;

            _context.ReadingHistories.Remove(readingHistory);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetTotalReadingHistoryCountAsync(int userId, ReadingHistoryFilterDTO? filter = null)
        {
            var query = _context.ReadingHistories.Where(rh => rh.UserId == userId);

            if (filter != null)
            {
                if (filter.BookId.HasValue)
                    query = query.Where(rh => rh.BookId == filter.BookId.Value);

                if (filter.ChapterId.HasValue)
                    query = query.Where(rh => rh.ChapterId == filter.ChapterId.Value);

                if (!string.IsNullOrEmpty(filter.ReadingType))
                    query = query.Where(rh => rh.ReadingType == filter.ReadingType);

                if (filter.FromDate.HasValue)
                    query = query.Where(rh => rh.LastReadAt >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(rh => rh.LastReadAt <= filter.ToDate.Value);
            }

            return await query.CountAsync();
        }

        public async Task<List<ReadingHistory>> GetByUserIdAsync(int userId)
        {
            return await _context.ReadingHistories
                .Where(rh => rh.UserId == userId)
                .Include(rh => rh.Book)
                .ToListAsync();
        }
    }
}