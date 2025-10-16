using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace Services.Implementations
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var acc = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(acc);
        }

        public async Task<string> UploadBookImageAsync(IFormFile file)
        {
            if (file.Length == 0) return null;

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "bookImages"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                return uploadResult.SecureUrl.ToString();

            return null;
        }

        private string ExtractPublicIdFromUrl(string url)
        {
            const string marker = "/upload/";
            var index = url.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (index < 0) return null;

            // lấy phần sau /upload/
            var afterUpload = url.Substring(index + marker.Length);

            // Bỏ version nếu có (v123456/...)
            var parts = afterUpload.Split('/');
            if (parts.Length > 1 && parts[0].StartsWith("v") && parts[0].Length > 1)
            {
                afterUpload = string.Join("/", parts.Skip(1));
            }

            // Bỏ đuôi .jpg / .png...
            var dotIndex = afterUpload.LastIndexOf('.');
            if (dotIndex > 0)
            {
                afterUpload = afterUpload.Substring(0, dotIndex);
            }

            return afterUpload;
        }

        //public async Task<bool> DeleteImageAsync(string imageUrl)
        //{
        //    if (string.IsNullOrWhiteSpace(imageUrl)) return false;

        //    var publicId = ExtractPublicIdFromUrl(imageUrl);
        //    if (string.IsNullOrEmpty(publicId)) return false;

        //    var deletionParams = new DeletionParams(publicId);
        //    var result = await _cloudinary.DestroyAsync(deletionParams);

        //    return result.Result == "ok";
        //}
        public async Task<bool> DeleteImageAsync(string fileUrl, bool isRaw = false)
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return false;

            var publicId = ExtractPublicIdFromUrl(fileUrl);
            if (string.IsNullOrEmpty(publicId)) return false;

            var deletionParams = new DeletionParams(publicId);
            if (isRaw)
            {
                deletionParams.ResourceType = ResourceType.Raw;
            }

            var result = await _cloudinary.DestroyAsync(deletionParams);

            return result.Result == "ok";
        }

        public async Task<string> UploadAvatarImageAsync(IFormFile file)
        {
            if (file.Length == 0) return null;

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "avatarImages"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                return uploadResult.SecureUrl.ToString();

            return null;
        }
        public async Task<string> UploadTextAsync(string content, string fileName)
        {
            if (string.IsNullOrWhiteSpace(content)) return null;

            var bytes = Encoding.UTF8.GetBytes(content);
            await using var stream = new MemoryStream(bytes);

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(fileName, stream),
                Folder = "bookChapters" // thư mục lưu chương
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                return uploadResult.SecureUrl.ToString();

            return null;
        }

        // upload file audio lên Cloudinary
        public async Task<string> UploadAudioAsync(Stream audioStream, string fileName)
        {
            if (audioStream == null || audioStream.Length == 0)
                return null;

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription($"{fileName}.mp3", audioStream),
                Folder = "chapterAudios"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                return uploadResult.SecureUrl.ToString();

            return null;
        }

        // thêm nếu muốn upload file audio trực tiếp từ IFormFile
        public async Task<string> UploadAudioFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            await using var stream = file.OpenReadStream();
            return await UploadAudioAsync(stream, Path.GetFileNameWithoutExtension(file.FileName));
        }
    }

    public class CloudinarySettings
    {
        public string CloudName { get; set; }
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }
    }
}
