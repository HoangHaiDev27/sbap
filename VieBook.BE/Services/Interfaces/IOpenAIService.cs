using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos.OpenAI;

namespace Services.Interfaces
{
    public interface IOpenAIService
    {
        Task<string> CheckSpellingAsync(CheckSpellingDto dto);
        Task<string> CheckMeaningAsync(CheckMeaningDto dto);
        Task<ModerationResult> ModerationAsync(ModerationDto dto);
        Task<PlagiarismResult> CheckPlagiarismAsync(PlagiarismChapterContentCommand command);
        Task GenerateAndSaveEmbeddingsAsync(int chapterId, string content);
        Task MigrateExistingChaptersAsync(); // Tạo embeddings cho tất cả chapters hiện có
        Task<string> SummarizeContentAsync(SummarizeCommand command);
    }
}