using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class ChapterService : IChapterService
    {
        private readonly IChapterRepository _chapterRepository;
        private readonly IBookRepository _bookRepository;

        public ChapterService(IChapterRepository chapterRepository, IBookRepository bookRepository)
        {
            _chapterRepository = chapterRepository;
            _bookRepository = bookRepository;
        }

        public async Task<List<Chapter>> GetAllChaptersAsync() => await _chapterRepository.GetAllChaptersAsync();

        public async Task<Chapter?> GetChapterByIdAsync(int chapterId) => await _chapterRepository.GetChapterByIdAsync(chapterId);

        public async Task AddChapterAsync(Chapter chapter)
        {
            // Validate that the book exists
            var book = await _bookRepository.GetByIdAsync(chapter.BookId);
            if (book == null)
            {
                throw new ArgumentException($"Book with ID {chapter.BookId} does not exist.");
            }

            await _chapterRepository.AddChapterAsync(chapter);
        }

        public async Task UpdateChapterAsync(Chapter chapter) => await _chapterRepository.UpdateChapterAsync(chapter);

        public async Task DeleteChapterAsync(int chapterId) => await _chapterRepository.DeleteChapterAsync(chapterId);

        public async Task IncrementChapterViewAsync(int chapterId) => await _chapterRepository.IncrementChapterViewAsync(chapterId);

        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId) => await _chapterRepository.GetChaptersByBookIdAsync(bookId);

        public async Task UpdateChapterAudioAsync(int chapterId, string audioUrl, int durationSec, decimal? priceSoft = null, string? storageMeta = null) =>
            await _chapterRepository.UpdateChapterAudioAsync(chapterId, audioUrl, durationSec, priceSoft, storageMeta);
    }
}
