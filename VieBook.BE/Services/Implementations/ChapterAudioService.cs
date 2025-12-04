using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class ChapterAudioService : IChapterAudioService
    {
        private readonly IChapterAudioRepository _chapterAudioRepository;

        public ChapterAudioService(IChapterAudioRepository chapterAudioRepository)
        {
            _chapterAudioRepository = chapterAudioRepository;
        }

        public async Task<List<ChapterAudio>> GetChapterAudiosByChapterIdAsync(int chapterId)
        {
            return await _chapterAudioRepository.GetChapterAudiosByChapterIdAsync(chapterId);
        }

        public async Task<ChapterAudio?> GetChapterAudioByIdAsync(int audioId)
        {
            return await _chapterAudioRepository.GetChapterAudioByIdAsync(audioId);
        }

        public async Task AddChapterAudioAsync(ChapterAudio chapterAudio)
        {
            await _chapterAudioRepository.AddChapterAudioAsync(chapterAudio);
        }

        public async Task UpdateChapterAudioAsync(ChapterAudio chapterAudio)
        {
            await _chapterAudioRepository.UpdateChapterAudioAsync(chapterAudio);
        }

        public async Task DeleteChapterAudioAsync(int audioId)
        {
            await _chapterAudioRepository.DeleteChapterAudioAsync(audioId);
        }

        public async Task<bool> HasAudioWithVoiceAsync(int chapterId, string voiceName)
        {
            return await _chapterAudioRepository.HasAudioWithVoiceAsync(chapterId, voiceName);
        }

        public async Task<ChapterAudio?> GetChapterAudioByVoiceAsync(int chapterId, string voiceName)
        {
            return await _chapterAudioRepository.GetChapterAudioByVoiceAsync(chapterId, voiceName);
        }

        public async Task UpdateAllAudioPricesByChapterIdAsync(int chapterId, decimal? price)
        {
            await _chapterAudioRepository.UpdateAllAudioPricesByChapterIdAsync(chapterId, price);
        }

        public async Task<List<ChapterAudio>> GetChapterAudiosByBookIdAsync(int bookId)
        {
            return await _chapterAudioRepository.GetChapterAudiosByBookIdAsync(bookId);
        }
    }
}
