using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class OpenAIRepository : IOpenAIRepository
    {
        private readonly OpenAIDAO _openAIDAO;
        public OpenAIRepository(OpenAIDAO openAIDAO)
        {
            _openAIDAO = openAIDAO;
        }
        public Task<BookEmbedding?> GetBookEmbeddingAsync(int bookId) => _openAIDAO.GetBookEmbeddingAsync(bookId);
        public Task<ChapterContentEmbedding?> GetChapterContentEmbeddingAsync(int chapterId) => _openAIDAO.GetChapterContentEmbeddingAsync(chapterId);
        public Task<ChapterChunkEmbedding?> GetChapterChunkEmbeddingAsync(int chunkId) => _openAIDAO.GetChapterChunkEmbeddingAsync(chunkId);
        public Task SaveBookEmbeddingAsync(int bookId, string vectorBook) => _openAIDAO.SaveBookEmbeddingAsync(bookId, vectorBook);
        public async Task SaveChapterContentEmbeddingAsync(int chapterId, string vectorChapterContent) => await _openAIDAO.SaveChapterContentEmbeddingAsync(chapterId, vectorChapterContent);
        public async Task SaveChapterChunkEmbeddingAsync(int chunkId, string vectorChapterChunk) => await _openAIDAO.SaveChapterChunkEmbeddingAsync(chunkId, vectorChapterChunk);

        public async Task<List<ChapterContentEmbedding>> GetAllChapterContentEmbeddingsAsync()
        {
            return await _openAIDAO.GetAllChapterContentEmbeddingsAsync();
        }

        public async Task<List<ChapterChunkEmbedding>> GetChapterChunkEmbeddingsAsync(int chapterId)
        {
            return await _openAIDAO.GetChapterChunkEmbeddingsAsync(chapterId);
        }
    }
}