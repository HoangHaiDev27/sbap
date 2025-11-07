using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    /// <summary>
    /// DTO để tạo sách mới cùng với chữ ký xác nhận (Save with Proof)
    /// </summary>
    public class CreateBookWithSignatureDto
    {
        // Book information (giống BookDTO)
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? CoverUrl { get; set; }
        public string? Isbn { get; set; }
        public string? Language { get; set; }
        public string? Author { get; set; }
        public int OwnerId { get; set; }
        public string Status { get; set; } = null!;
        public string? UploaderType { get; set; }
        public string? UploadStatus { get; set; }
        public string? CompletionStatus { get; set; }
        public string? CertificateUrl { get; set; }
        public List<int> CategoryIds { get; set; } = new();

        // Signature data
        /// <summary>
        /// Chữ ký dưới dạng Base64 string (không có prefix data:image/png;base64,)
        /// </summary>
        public string SignatureImageBase64 { get; set; } = null!;
    }
}

