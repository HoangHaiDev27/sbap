using System;
using System.IO;
using System.Text;

namespace VieBook.BE.Helpers
{
    public static class SignatureHelper
    {
        /// <summary>
        /// Lưu chữ ký từ Base64 string vào file trong wwwroot/signatures
        /// </summary>
        /// <param name="base64String">Chuỗi Base64 của ảnh chữ ký (có thể có hoặc không có prefix data:image/png;base64,)</param>
        /// <param name="webRootPath">Đường dẫn tới thư mục wwwroot (từ IWebHostEnvironment.WebRootPath)</param>
        /// <returns>Đường dẫn tương đối của file đã lưu (ví dụ: /signatures/abc-123.png)</returns>
        public static string SaveSignatureFromBase64(string base64String, string webRootPath)
        {
            if (string.IsNullOrWhiteSpace(base64String))
                throw new ArgumentException("Base64 string cannot be empty", nameof(base64String));

            if (string.IsNullOrWhiteSpace(webRootPath))
                throw new ArgumentException("WebRootPath cannot be empty", nameof(webRootPath));

            // Loại bỏ prefix nếu có (data:image/png;base64,)
            string cleanBase64 = base64String;
            if (base64String.Contains(","))
            {
                cleanBase64 = base64String.Split(',')[1];
            }

            // Decode Base64 thành byte array
            byte[] imageBytes;
            try
            {
                imageBytes = Convert.FromBase64String(cleanBase64);
            }
            catch (FormatException ex)
            {
                throw new ArgumentException("Invalid Base64 string format", nameof(base64String), ex);
            }

            // Tạo thư mục signatures nếu chưa tồn tại
            string signaturesFolder = Path.Combine(webRootPath, "signatures");
            if (!Directory.Exists(signaturesFolder))
            {
                Directory.CreateDirectory(signaturesFolder);
            }

            // Tạo tên file duy nhất với Guid
            string fileName = $"{Guid.NewGuid()}.png";
            string filePath = Path.Combine(signaturesFolder, fileName);

            // Lưu file
            File.WriteAllBytes(filePath, imageBytes);

            // Trả về đường dẫn tương đối
            return $"/signatures/{fileName}";
        }
    }
}

