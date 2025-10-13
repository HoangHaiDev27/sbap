using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class OpenAIDAO
    {
        private readonly VieBookContext _context;

        public OpenAIDAO(VieBookContext context)
        {
            _context = context;
        }
        public async Task<BookEmbedding?> GetBookEmbeddingAsync(int bookId)
        {
            return await _context.BookEmbeddings.FindAsync(bookId);
        }
        public async Task<ChapterContentEmbedding?> GetChapterContentEmbeddingAsync(int chapterId)
        {
            return await _context.ChapterContentEmbeddings.FindAsync(chapterId);
        }
        public async Task<ChapterChunkEmbedding?> GetChapterChunkEmbeddingAsync(int chunkId)
        {
            return await _context.ChapterChunkEmbeddings.FindAsync(chunkId);
        }
        public async Task SaveBookEmbeddingAsync(int bookId, string vectorBook)
        {
            var bookEmbedding = await _context.BookEmbeddings.FindAsync(bookId);
            if (bookEmbedding == null)
            {
                bookEmbedding = new BookEmbedding
                {
                    BookId = bookId,
                    VectorBook = vectorBook,
                };
            }
            _context.BookEmbeddings.Update(bookEmbedding);
            await _context.SaveChangesAsync();
        }
        public async Task SaveChapterContentEmbeddingAsync(int chapterId, string vectorChapterContent)
        {
            var chapterContentEmbedding = await _context.ChapterContentEmbeddings.FindAsync(chapterId);
            // Ensure we have BookId from Chapter
            var chapter = await _context.Chapters.FindAsync(chapterId);
            if (chapter == null)
            {
                throw new InvalidOperationException($"Chapter {chapterId} not found while saving content embedding.");
            }
            if (chapterContentEmbedding == null)
            {
                chapterContentEmbedding = new ChapterContentEmbedding
                {
                    ChapterId = chapterId,
                    BookId = chapter.BookId,
                    VectorChapterContent = vectorChapterContent,
                };
                await _context.ChapterContentEmbeddings.AddAsync(chapterContentEmbedding);
            }
            else
            {
                chapterContentEmbedding.BookId = chapter.BookId;
                chapterContentEmbedding.VectorChapterContent = vectorChapterContent;
                _context.ChapterContentEmbeddings.Update(chapterContentEmbedding);
            }
            await _context.SaveChangesAsync();
        }
        public async Task SaveChapterChunkEmbeddingAsync(int chunkId, string vectorChapterChunk)
        {
            // Derive composite keys
            var chapterId = chunkId / 1000;
            var chunkIndex = chunkId % 1000;

            var chapter = await _context.Chapters.FindAsync(chapterId);
            if (chapter == null)
            {
                throw new InvalidOperationException($"Chapter {chapterId} not found while saving chunk embedding.");
            }

            // Upsert by (ChapterId, ChunkIndex) because ChunkId is identity in DB
            var chapterChunkEmbedding = await _context.ChapterChunkEmbeddings
                .FirstOrDefaultAsync(e => e.ChapterId == chapterId && e.ChunkIndex == chunkIndex);

            if (chapterChunkEmbedding == null)
            {
                chapterChunkEmbedding = new ChapterChunkEmbedding
                {
                    ChapterId = chapterId,
                    BookId = chapter.BookId,
                    ChunkIndex = chunkIndex,
                    VectorChunkContent = vectorChapterChunk
                };
                await _context.ChapterChunkEmbeddings.AddAsync(chapterChunkEmbedding);
            }
            else
            {
                chapterChunkEmbedding.BookId = chapter.BookId;
                chapterChunkEmbedding.VectorChunkContent = vectorChapterChunk;
                _context.ChapterChunkEmbeddings.Update(chapterChunkEmbedding);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<ChapterContentEmbedding>> GetAllChapterContentEmbeddingsAsync()
        {
            return await _context.ChapterContentEmbeddings
                .Include(ce => ce.Chapter)
                .ThenInclude(c => c.Book)
                .Where(ce => ce.Chapter.Status == "Active")
                .ToListAsync();
        }

        public async Task<List<ChapterChunkEmbedding>> GetChapterChunkEmbeddingsAsync(int chapterId)
        {
            return await _context.ChapterChunkEmbeddings
                .Where(ce => ce.ChapterId == chapterId)
                .Include(ce => ce.Chapter)
                .ThenInclude(c => c.Book)
                .ToListAsync();
        }

    }
}