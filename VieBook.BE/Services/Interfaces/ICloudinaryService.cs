using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadBookImageAsync(IFormFile file);
        Task<string> UploadAvatarImageAsync(IFormFile file, string oldAvatarUrl = null);
        Task<bool> DeleteImageAsync(string fileUrl, bool isRaw = false);
        Task<string> UploadCertificateAsync(IFormFile file);
        Task<string> UploadPostImageAsync(IFormFile file);
    }
}
