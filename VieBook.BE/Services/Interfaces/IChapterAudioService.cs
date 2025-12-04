using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IChapterAudioService
    {
        Task<List<ChapterAudio>> GetChapterAudiosByChapterIdAsync(int chapterId);
        Task<ChapterAudio?> GetChapterAudioByIdAsync(int audioId);
        Task AddChapterAudioAsync(ChapterAudio chapterAudio);
        Task UpdateChapterAudioAsync(ChapterAudio chapterAudio);
        Task DeleteChapterAudioAsync(int audioId);
        Task<bool> HasAudioWithVoiceAsync(int chapterId, string voiceName);
        Task<ChapterAudio?> GetChapterAudioByVoiceAsync(int chapterId, string voiceName);
        Task UpdateAllAudioPricesByChapterIdAsync(int chapterId, decimal? price);
        Task<List<ChapterAudio>> GetChapterAudiosByBookIdAsync(int bookId);
    }
}
