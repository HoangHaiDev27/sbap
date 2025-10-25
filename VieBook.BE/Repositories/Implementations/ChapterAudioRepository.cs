using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class ChapterAudioRepository : IChapterAudioRepository
    {
        private readonly ChapterAudioDAO _chapterAudioDao;

        public ChapterAudioRepository(ChapterAudioDAO chapterAudioDao)
        {
            _chapterAudioDao = chapterAudioDao;
        }

        public async Task<List<ChapterAudio>> GetChapterAudiosByChapterIdAsync(int chapterId)
        {
            return await _chapterAudioDao.GetChapterAudiosByChapterIdAsync(chapterId);
        }

        public async Task<ChapterAudio?> GetChapterAudioByIdAsync(int audioId)
        {
            return await _chapterAudioDao.GetChapterAudioByIdAsync(audioId);
        }

        public async Task AddChapterAudioAsync(ChapterAudio chapterAudio)
        {
            await _chapterAudioDao.AddChapterAudioAsync(chapterAudio);
        }

        public async Task UpdateChapterAudioAsync(ChapterAudio chapterAudio)
        {
            await _chapterAudioDao.UpdateChapterAudioAsync(chapterAudio);
        }

        public async Task DeleteChapterAudioAsync(int audioId)
        {
            await _chapterAudioDao.DeleteChapterAudioAsync(audioId);
        }

        public async Task<bool> HasAudioWithVoiceAsync(int chapterId, string voiceName)
        {
            return await _chapterAudioDao.HasAudioWithVoiceAsync(chapterId, voiceName);
        }

        public async Task<ChapterAudio?> GetChapterAudioByVoiceAsync(int chapterId, string voiceName)
        {
            return await _chapterAudioDao.GetChapterAudioByVoiceAsync(chapterId, voiceName);
        }

        public async Task UpdateAllAudioPricesByChapterIdAsync(int chapterId, decimal? price)
        {
            await _chapterAudioDao.UpdateAllAudioPricesByChapterIdAsync(chapterId, price);
        }

        public async Task<List<ChapterAudio>> GetChapterAudiosByBookIdAsync(int bookId)
        {
            return await _chapterAudioDao.GetChapterAudiosByBookIdAsync(bookId);
        }
    }
}
