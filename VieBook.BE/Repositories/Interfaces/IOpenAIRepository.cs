using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IOpenAIRepository
    {
        public Task<BookEmbedding?> GetBookEmbeddingAsync(int bookId);
        public Task<ChapterContentEmbedding?> GetChapterContentEmbeddingAsync(int chapterId);
        public Task<ChapterChunkEmbedding?> GetChapterChunkEmbeddingAsync(int chunkId);
        public Task<List<ChapterContentEmbedding>> GetAllChapterContentEmbeddingsAsync();
        public Task<List<ChapterChunkEmbedding>> GetChapterChunkEmbeddingsAsync(int chapterId);
        public Task SaveBookEmbeddingAsync(int bookId, string vectorBook);
        public Task SaveChapterContentEmbeddingAsync(int chapterId, string vectorChapterContent);
        public Task SaveChapterChunkEmbeddingAsync(int chunkId, string vectorChapterChunk);
    }
}