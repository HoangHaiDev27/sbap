using System;

namespace BusinessObject.Dtos
{
    public class PostReactionDTO
    {
        public long PostId { get; set; }
        public int UserId { get; set; }
        public string ReactionType { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public UserDTO? User { get; set; }
    }

    public class CreatePostReactionDTO
    {
        public long PostId { get; set; }
        public string ReactionType { get; set; } = "Like"; // Like, Love, etc.
    }

    public class DeletePostReactionDTO
    {
        public long PostId { get; set; }
    }
}


