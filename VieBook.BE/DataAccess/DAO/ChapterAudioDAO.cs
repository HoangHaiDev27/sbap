using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class ChapterAudioDAO
    {
        private readonly VieBookContext _context;

        public ChapterAudioDAO(VieBookContext context)
        {
            _context = context;
        }

        // Lấy tất cả audio của một chapter
        public async Task<List<ChapterAudio>> GetChapterAudiosByChapterIdAsync(int chapterId)
        {
            return await _context.ChapterAudios
                .Include(ca => ca.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(ca => ca.ChapterId == chapterId)
                .OrderByDescending(ca => ca.CreatedAt)
                .ToListAsync();
        }

        // Lấy audio theo ID
        public async Task<ChapterAudio?> GetChapterAudioByIdAsync(int audioId)
        {
            return await _context.ChapterAudios
                .Include(ca => ca.Chapter)
                .Include(ca => ca.User)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(ca => ca.AudioId == audioId);
        }

        // Thêm audio mới
        public async Task AddChapterAudioAsync(ChapterAudio chapterAudio)
        {
            _context.ChapterAudios.Add(chapterAudio);
            await _context.SaveChangesAsync();
        }

        // Cập nhật audio
        public async Task UpdateChapterAudioAsync(ChapterAudio chapterAudio)
        {
            _context.ChapterAudios.Update(chapterAudio);
            await _context.SaveChangesAsync();
        }

        // Xóa audio
        public async Task DeleteChapterAudioAsync(int audioId)
        {
            var chapterAudio = await _context.ChapterAudios.FindAsync(audioId);
            if (chapterAudio != null)
            {
                _context.ChapterAudios.Remove(chapterAudio);
                await _context.SaveChangesAsync();
            }
        }

        // Kiểm tra xem chapter đã có audio với voice này chưa
        public async Task<bool> HasAudioWithVoiceAsync(int chapterId, string voiceName)
        {
            return await _context.ChapterAudios
                .AnyAsync(ca => ca.ChapterId == chapterId && ca.VoiceName == voiceName);
        }

        // Lấy audio theo voice name
        public async Task<ChapterAudio?> GetChapterAudioByVoiceAsync(int chapterId, string voiceName)
        {
            return await _context.ChapterAudios
                .Include(ca => ca.User)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(ca => ca.ChapterId == chapterId && ca.VoiceName == voiceName);
        }

        // Cập nhật giá cho tất cả audio của chapter
        public async Task UpdateAllAudioPricesByChapterIdAsync(int chapterId, decimal? price)
        {
            var audios = await _context.ChapterAudios
                .Where(ca => ca.ChapterId == chapterId)
                .ToListAsync();

            foreach (var audio in audios)
            {
                audio.PriceSoft = price;
            }

            await _context.SaveChangesAsync();
        }

        // Lấy tất cả audio của book (theo bookId)
        public async Task<List<ChapterAudio>> GetChapterAudiosByBookIdAsync(int bookId)
        {
            return await _context.ChapterAudios
                .Include(ca => ca.Chapter)
                .Include(ca => ca.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(ca => ca.Chapter.BookId == bookId)
                .OrderBy(ca => ca.ChapterId) // Sort theo ChapterId (chapter tạo trước có ID nhỏ hơn)
                .ThenByDescending(ca => ca.CreatedAt) // Nếu cùng chapter thì lấy audio mới nhất
                .ToListAsync();
        }
    }
}
