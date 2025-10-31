using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class UpdateBookDTO
    {
        public int BookId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public string? Author { get; set; }
        public string Status { get; set; } = null!;
        public string? UploaderType { get; set; }
        public string? UploadStatus { get; set; }
        public string? CompletionStatus { get; set; }
        public string? CertificateUrl { get; set; }

        // Categories
        public List<int> CategoryIds { get; set; } = new();
    }
}

