using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class PostCommentDTO
    {
        public long CommentId { get; set; }
        public long PostId { get; set; }
        public long? ParentCommentId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDTO? User { get; set; }
        public List<PostCommentDTO>? Replies { get; set; }
    }

    public class CreatePostCommentDTO
    {
        public long PostId { get; set; }
        public long? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
    }

    public class UpdatePostCommentDTO
    {
        public string Content { get; set; } = null!;
    }
}


