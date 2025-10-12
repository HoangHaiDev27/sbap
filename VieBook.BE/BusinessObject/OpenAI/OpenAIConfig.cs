using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.OpenAI
{
    public class OpenAIConfig
    {
        public string ApiKey { get; set; }
        public string SummaryModel { get; set; }
        public string SummaryUrl { get; set; }
        public string EmbeddingModel { get; set; }
        public string EmbeddingUrl { get; set; }
        public string ModerationModel { get; set; }
        public string ModerationUrl { get; set; }
    }
}