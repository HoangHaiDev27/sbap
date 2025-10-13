using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos.OpenAI
{
    public class ModerationResult
    {
        public bool Flagged { get; set; }
        public Dictionary<string, bool> Categories { get; set; }
        public Dictionary<string, float> CategoryScores { get; set; }
    }
}