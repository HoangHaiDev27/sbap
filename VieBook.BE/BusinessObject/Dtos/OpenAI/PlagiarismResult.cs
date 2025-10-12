using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class PlagiarismResult
    {
        public string Classification { get; set; } = string.Empty; // "Clear", "Related", "None"
        public double Similarity { get; set; }
        public List<PlagiarismMatch> Matches { get; set; } = new List<PlagiarismMatch>();
        public bool Passed { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class PlagiarismMatch
    {
        public int ChapterId { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public double Similarity { get; set; }
        public double Coverage { get; set; }
        public double LiteralOverlap { get; set; }
        public List<ChunkMatch> ChunkMatches { get; set; } = new List<ChunkMatch>();
    }

    public class ChunkMatch
    {
        public int InputChunkIndex { get; set; }
        public int SourceChunkIndex { get; set; }
        public double Similarity { get; set; }
        public string InputText { get; set; } = string.Empty;
        public string SourceText { get; set; } = string.Empty;
    }
}
