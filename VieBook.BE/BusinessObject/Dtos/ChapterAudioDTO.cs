using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class ChapterAudioDTO
    {
        public int AudioId { get; set; }
        public int ChapterId { get; set; }
        public int UserId { get; set; }
        public string AudioLink { get; set; } = null!;
        public int? DurationSec { get; set; }
        public decimal? PriceSoft { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? VoiceName { get; set; }
        public string? UserName { get; set; }
    }

    public class ChapterAudioCreateDTO
    {
        public int ChapterId { get; set; }
        public int UserId { get; set; }
        public string AudioLink { get; set; } = null!;
        public int? DurationSec { get; set; }
        public decimal? PriceSoft { get; set; }
        public string? VoiceName { get; set; }
    }

    public class UpdateAudioPriceRequest
    {
        public decimal? PriceSoft { get; set; }
    }
}
