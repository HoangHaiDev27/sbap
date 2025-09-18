using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class ChapterDTO
    {
        public int ChapterId { get; set; }
        public string ChapterTitle { get; set; } = null!;
        public int ChapterView { get; set; }
        public string? ChapterSoftUrl { get; set; }
        public string? ChapterAudioUrl { get; set; }
        public int? DurationSec { get; set; }
        public decimal? PriceAudio { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
