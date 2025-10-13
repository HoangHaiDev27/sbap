using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace BusinessObject.Helper
{
    public static class PlagiarismHelper
    {
        // Constants
        public const int WordsPerChunk = 200;
        public const double SimilarityThreshold = 0.75;
        public const double SimilarityThresholdChunk = 0.75;
        public const int LiteralNgramPrimary = 8;
        public const int LiteralNgramSecondary = 6;
        public const int PhraseGramSize = 5;
        public const int MinWordsForSemantic = 50;
        public const int ContentWordMinLength = 5;

        /// <summary>
        /// Stage 1: Preprocessing - Clean HTML and split into chunks
        /// </summary>
        public static string StripHtmlTags(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            // Remove HTML tags
            var withoutTags = Regex.Replace(input, "<[^>]+>", " ");

            // Decode HTML entities
            var decoded = withoutTags
                .Replace("&nbsp;", " ")
                .Replace("&quot;", "\"")
                .Replace("&amp;", "&")
                .Replace("&lt;", "<")
                .Replace("&gt;", ">")
                .Replace("&apos;", "'");

            // Clean up multiple spaces
            return Regex.Replace(decoded, @"\s+", " ").Trim();
        }

        public static List<string> SplitText(string text, int wordsPerChunk = WordsPerChunk)
        {
            if (string.IsNullOrWhiteSpace(text))
                return new List<string>();

            var words = text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            var chunks = new List<string>();

            for (int i = 0; i < words.Length; i += wordsPerChunk)
            {
                var chunk = string.Join(" ", words.Skip(i).Take(wordsPerChunk));
                if (!string.IsNullOrWhiteSpace(chunk))
                    chunks.Add(chunk);
            }

            return chunks;
        }

        /// <summary>
        /// Stage 3: Multi-Signal Analysis - Compute cosine similarity
        /// </summary>
        public static double ComputeCosineSimilarity(List<float> vector1, List<float> vector2)
        {
            if (vector1.Count != vector2.Count)
                throw new ArgumentException("Vectors must have the same dimension");

            double dotProduct = 0;
            double norm1 = 0;
            double norm2 = 0;

            for (int i = 0; i < vector1.Count; i++)
            {
                dotProduct += vector1[i] * vector2[i];
                norm1 += vector1[i] * vector1[i];
                norm2 += vector2[i] * vector2[i];
            }

            if (norm1 == 0 || norm2 == 0)
                return 0;

            return dotProduct / (Math.Sqrt(norm1) * Math.Sqrt(norm2));
        }

        /// <summary>
        /// Stage 3: Compute semantic coverage between input chunks and source chunks
        /// </summary>
        public static double ComputeSemanticCoverage(
            List<List<float>> inputChunkEmbeddings,
            List<List<float>> sourceChunkEmbeddings,
            double threshold = SimilarityThresholdChunk)
        {
            if (!inputChunkEmbeddings.Any() || !sourceChunkEmbeddings.Any())
                return 0;

            int coveredChunks = 0;

            foreach (var inputChunk in inputChunkEmbeddings)
            {
                bool isCovered = sourceChunkEmbeddings.Any(sourceChunk =>
                    ComputeCosineSimilarity(inputChunk, sourceChunk) >= threshold);

                if (isCovered)
                    coveredChunks++;
            }

            return (double)coveredChunks / inputChunkEmbeddings.Count;
        }

        /// <summary>
        /// Stage 3: Compute weighted literal overlap using N-grams
        /// </summary>
        public static double ComputeWeightedLiteralOverlap(string text1, string text2)
        {
            if (string.IsNullOrWhiteSpace(text1) || string.IsNullOrWhiteSpace(text2))
                return 0;

            var ngrams1 = GenerateNgrams(text1, LiteralNgramPrimary);
            var ngrams2 = GenerateNgrams(text2, LiteralNgramPrimary);
            var primaryOverlap = ComputeNgramOverlap(ngrams1, ngrams2);

            var ngrams1Secondary = GenerateNgrams(text1, LiteralNgramSecondary);
            var ngrams2Secondary = GenerateNgrams(text2, LiteralNgramSecondary);
            var secondaryOverlap = ComputeNgramOverlap(ngrams1Secondary, ngrams2Secondary);

            // Weighted combination: 70% primary, 30% secondary
            return 0.7 * primaryOverlap + 0.3 * secondaryOverlap;
        }

        private static List<string> GenerateNgrams(string text, int n)
        {
            var words = text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            var ngrams = new List<string>();

            for (int i = 0; i <= words.Length - n; i++)
            {
                var ngram = string.Join(" ", words.Skip(i).Take(n));
                ngrams.Add(ngram.ToLowerInvariant());
            }

            return ngrams;
        }

        private static double ComputeNgramOverlap(List<string> ngrams1, List<string> ngrams2)
        {
            if (!ngrams1.Any() || !ngrams2.Any())
                return 0;

            var set1 = new HashSet<string>(ngrams1);
            var set2 = new HashSet<string>(ngrams2);
            var intersection = set1.Intersect(set2).Count();

            return (double)intersection / Math.Max(set1.Count, set2.Count);
        }

        /// <summary>
        /// Stage 3: Compute content word overlap
        /// </summary>
        public static double ComputeContentWordOverlap(string text1, string text2)
        {
            var words1 = ExtractContentWords(text1);
            var words2 = ExtractContentWords(text2);

            if (!words1.Any() || !words2.Any())
                return 0;

            var set1 = new HashSet<string>(words1);
            var set2 = new HashSet<string>(words2);
            var intersection = set1.Intersect(set2).Count();

            return (double)intersection / Math.Max(set1.Count, set2.Count);
        }

        private static List<string> ExtractContentWords(string text)
        {
            return text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
                .Where(word => word.Length >= ContentWordMinLength)
                .Select(word => word.ToLowerInvariant().Trim(new char[] { '.', ',', '!', '?', ';', ':', '"', '(', ')', '[', ']', '{', '}' }))
                .Where(word => !string.IsNullOrWhiteSpace(word))
                .ToList();
        }

        /// <summary>
        /// Stage 3: Compute phrase overlap
        /// </summary>
        public static int ComputePhraseOverlap(string text1, string text2)
        {
            var phrases1 = GenerateNgrams(text1, PhraseGramSize);
            var phrases2 = GenerateNgrams(text2, PhraseGramSize);

            var set1 = new HashSet<string>(phrases1);
            var set2 = new HashSet<string>(phrases2);

            return set1.Intersect(set2).Count();
        }

        /// <summary>
        /// Stage 4: Check if this is context-only similarity (false positive)
        /// </summary>
        public static bool IsContextOnly(double contentWordOverlap, int phraseOverlap, int inputWordCount)
        {
            // Very low thresholds to filter out general topic similarity
            const double contentWordThreshold = 0.05; // 5% word overlap
            const double phraseThresholdRatio = 0.01; // 1% phrase overlap ratio

            var phraseThreshold = Math.Max(1, (int)(inputWordCount * phraseThresholdRatio));

            return contentWordOverlap < contentWordThreshold && phraseOverlap < phraseThreshold;
        }

        /// <summary>
        /// Stage 4: Classify plagiarism level
        /// </summary>
        public static string ClassifyPlagiarism(
            double scoreFull,
            double coverage,
            double literalOverlap,
            double contentWordOverlap,
            int phraseOverlap,
            int inputWordCount)
        {
            // Check for context-only similarity first
            if (IsContextOnly(contentWordOverlap, phraseOverlap, inputWordCount))
                return "None";

            // Classification logic
            if (scoreFull >= 0.85 && coverage >= 0.6)
                return "Clear";

            if (scoreFull >= 0.75 && (coverage >= 0.4 || literalOverlap >= 0.3))
                return "Clear";

            if (literalOverlap >= 0.5)
                return "Clear";

            if (scoreFull >= 0.7 || coverage >= 0.3 || literalOverlap >= 0.2)
                return "Related";

            return "None";
        }

        /// <summary>
        /// Parse embedding string to float list
        /// </summary>
        public static List<float> ParseEmbedding(string embeddingString)
        {
            if (string.IsNullOrWhiteSpace(embeddingString))
                return new List<float>();

            return embeddingString.Split(',')
                .Select(s => float.TryParse(s.Trim(), out float value) ? value : 0f)
                .ToList();
        }

        /// <summary>
        /// Convert float list to embedding string
        /// </summary>
        public static string EmbeddingToString(List<float> embedding)
        {
            return string.Join(",", embedding.Select(f => f.ToString()));
        }
    }
}
