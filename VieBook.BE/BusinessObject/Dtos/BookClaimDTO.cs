using System;

namespace BusinessObject.Dtos
{
    public class BookClaimDTO
    {
        public long ClaimId { get; set; }
        public long BookOfferId { get; set; }
        public int CustomerId { get; set; }
        public int? ChapterId { get; set; }
        public int? AudioId { get; set; }
        public string? Note { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public int? ProcessedBy { get; set; }
        public BookOfferDTO? BookOffer { get; set; }
        public ChapterDTO? Chapter { get; set; }
        public ChapterAudioDTO? ChapterAudio { get; set; }
        public UserDTO? Customer { get; set; }
    }

    public class CreateBookClaimDTO
    {
        public long BookOfferId { get; set; }
        public int? ChapterId { get; set; }
        public int? AudioId { get; set; }
        public string? Note { get; set; }
    }

    public class UpdateBookClaimDTO
    {
        public string Status { get; set; } = null!;
        public string? Note { get; set; }
    }
}

