using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookmarkDTO
    {
        public int BookmarkId { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public int? ChapterReadId { get; set; }
        public int? ChapterListenId { get; set; }
        public int? PagePosition { get; set; }
        public int? AudioPosition { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBookmarkDTO
    {
        public int BookId { get; set; }
        public int? ChapterReadId { get; set; }
        public int? ChapterListenId { get; set; }
        public int? PagePosition { get; set; }
        public int? AudioPosition { get; set; }
    }

    public class UpdateBookmarkDTO
    {
        public int BookmarkId { get; set; }
        public int? PagePosition { get; set; }
        public int? AudioPosition { get; set; }
    }
}
