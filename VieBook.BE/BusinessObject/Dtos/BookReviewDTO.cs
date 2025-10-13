using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookReviewDTO
    {
        public int ReviewId { get; set; }
        public int BookId { get; set; }
        public string? BookTitle { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? AvatarUrl { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? OwnerReply { get; set; }
        public DateTime? OwnerReplyAt { get; set; }
    }
}
