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
    }
}
