using BusinessObject.Models;
using DataAccess;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Repositories.Implementations
{
    namespace DataAccess.Repository
    {
        public class ChapterRepository : IChapterRepository
        {
            private readonly ChapterDAO _chapterDao;

            public ChapterRepository(ChapterDAO chapterDao)
            {
                _chapterDao = chapterDao;
            }

            public async Task<List<Chapter>> GetAllChaptersAsync()
            {
                return await _chapterDao.GetAllAsync();
            }

            public async Task<Chapter?> GetChapterByIdAsync(int chapterId)
            {
                return await _chapterDao.GetByIdAsync(chapterId);
            }

            public async Task AddChapterAsync(Chapter chapter)
            {
                await _chapterDao.InsertAsync(chapter);
            }

            public async Task UpdateChapterAsync(Chapter chapter)
            {
                await _chapterDao.UpdateAsync(chapter);
            }

            public async Task DeleteChapterAsync(int chapterId)
            {
                await _chapterDao.DeleteAsync(chapterId);
            }

            public async Task IncrementChapterViewAsync(int chapterId)
            {
                await _chapterDao.IncrementViewAsync(chapterId);
            }

            public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
            {
                return await _chapterDao.GetChaptersByBookIdAsync(bookId);
            }

            public async Task UpdateChapterAudioAsync(int chapterId, string audioUrl, int durationSec, decimal? priceSoft = null, string? storageMeta = null)
            {
                await _chapterDao.UpdateAudioAsync(chapterId, audioUrl, durationSec, priceSoft, storageMeta);
            }
        }
    }

}
