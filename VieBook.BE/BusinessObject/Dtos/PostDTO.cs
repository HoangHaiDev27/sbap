using System;

namespace BusinessObject.Dtos
{
    public class PostDTO
    {
        public long PostId { get; set; }
        public int AuthorId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public List<string>? Tags { get; set; }
        public string? PostType { get; set; }
        public string Visibility { get; set; } = null!;
        public int CommentCount { get; set; }
        public int ReactionCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDTO? Author { get; set; }
        public BookOfferDTO? BookOffer { get; set; }
        public List<PostAttachmentDTO>? Attachments { get; set; }
    }

    public class CreatePostDTO
    {
        public string? Content { get; set; }
        public string? PostType { get; set; }
        public string Visibility { get; set; } = "Public";
        public string? Title { get; set; }
        public List<string>? Tags { get; set; }
        public CreateBookOfferDTO? BookOffer { get; set; }
        public string? ImageUrl { get; set; } // URL của ảnh đã upload
    }

    public class PostAttachmentDTO
    {
        public long AttachmentId { get; set; }
        public string FileUrl { get; set; } = null!;
        public string FileType { get; set; } = null!;
    }

    public class UpdateVisibilityDTO
    {
        public string Visibility { get; set; } = null!;
    }
}

