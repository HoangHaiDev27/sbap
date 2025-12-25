using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class UserSimilarity
    {
        public int UserId { get; set; }
        public double SimilarityScore { get; set; }
        public List<int> CommonBooks { get; set; } = new List<int>();
        public double RatingCorrelation { get; set; }
        public double CategoryOverlap { get; set; }
    }
}
