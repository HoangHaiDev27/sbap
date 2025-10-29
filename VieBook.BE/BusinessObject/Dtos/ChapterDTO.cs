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
        public int DurationSec { get; set; }
        public decimal PriceSoft { get; set; }
        public DateTime UploadedAt { get; set; }
    }
    public class ChapterViewDTO
    {
        public int ChapterId { get; set; }
        public int BookId { get; set; }
        public string ChapterTitle { get; set; } = null!;
        public int ChapterView { get; set; }
        public string? ChapterSoftUrl { get; set; }
        public int? TotalPage { get; set; }
        public string? ChapterAudioUrl { get; set; }
        public int? DurationSec { get; set; }
        public decimal? PriceSoft { get; set; }
        public decimal? AudioPrice { get; set; } 
        public string? StorageMeta { get; set; }
        public DateTime UploadedAt { get; set; }
        public string? BookTitle { get; set; }
        public string? Status { get; set; }
        public string? VoiceName { get; set; }
    }
    public class ChapterUploadDto
    {
        public int BookId { get; set; }
        public string Title { get; set; }
        public int Price { get; set; }
        public bool IsFree { get; set; }
        public string Content { get; set; }
        public string? Status { get; set; }
    }
}
