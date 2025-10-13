using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces.Admin
{
    public interface IAdminService
    {
        Task<User> GetProfileAsync(int id);
        Task<User> UpdateProfileAsync(int id, AdminProfileDTO dto);
        Task UpdateAvatarUrlAsync(int adminId, string? newUrl);
        Task<string> UploadAvatarAsync(int adminId, IFormFile file);
        Task<bool> DeleteAvatarAsync(int adminId);
    }
}
