using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IChapterRepository
    {
        Task<List<Chapter>> GetAllChaptersAsync();
        Task<Chapter?> GetChapterByIdAsync(int chapterId);
        Task AddChapterAsync(Chapter chapter);
        Task UpdateChapterAsync(Chapter chapter);
        Task DeleteChapterAsync(int chapterId);
        Task IncrementChapterViewAsync(int chapterId);
        Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId);
        Task UpdateChapterAudioAsync(int chapterId, string audioUrl, int durationSec, decimal? priceAudio = null, string? storageMeta = null);
    }
}
