using System;

namespace BusinessObject.Dtos
{
    public class BookOfferDTO
    {
        public long BookOfferId { get; set; }
        public long PostId { get; set; }
        public int OwnerId { get; set; }
        public int BookId { get; set; }
        public int? ChapterId { get; set; }
        public int? AudioId { get; set; }
        public string AccessType { get; set; } = null!; // Soft/Audio/Both
        public int Quantity { get; set; }
        public string? Criteria { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime? EndAt { get; set; }
        public string Status { get; set; } = null!;
        public BookDTO? Book { get; set; }
        public ChapterDTO? Chapter { get; set; }
        public ChapterAudioDTO? ChapterAudio { get; set; }
        public UserDTO? Owner { get; set; }
        public int ClaimCount { get; set; }
        public int ApprovedClaimCount { get; set; }
    }

    public class CreateBookOfferDTO
    {
        public long PostId { get; set; }
        public int BookId { get; set; }
        public int? ChapterId { get; set; }
        public int? AudioId { get; set; }
        public string AccessType { get; set; } = null!; // Soft/Audio/Both
        public int Quantity { get; set; }
        public string? Criteria { get; set; }
        public DateTime? EndAt { get; set; }
    }

    public class UpdateBookOfferDTO
    {
        public string? AccessType { get; set; }
        public int? Quantity { get; set; }
        public string? Criteria { get; set; }
        public DateTime? EndAt { get; set; }
        public string? Status { get; set; }
    }
}

