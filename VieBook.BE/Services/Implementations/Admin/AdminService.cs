using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using Repositories.Interfaces.Admin;
using Services.Interfaces.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations.Admin
{
    public class AdminService : IAdminService
    {
        private readonly IAdminRepository _repo;
        private readonly CloudinaryService _cloudinaryService;

        public AdminService(IAdminRepository repo, CloudinaryService cloudinaryService)
        {
            _repo = repo;
            _cloudinaryService = cloudinaryService;
        }
        public async Task<User> GetProfileAsync(int id)
        {
            var user = await _repo.GetAdminByIdAsync(id);
            if (user == null) throw new Exception("Admin not found");
            return user;
        }

        public async Task<User> UpdateProfileAsync(int id, AdminProfileDTO dto)
        {
            var user = await _repo.GetAdminByIdAsync(id);
            if (user == null)
                throw new Exception("Không tìm thấy admin.");

            if (user.UserProfile == null)
                user.UserProfile = new UserProfile();

            if (!string.IsNullOrEmpty(dto.FullName))
                user.UserProfile.FullName = dto.FullName;

            if (!string.IsNullOrEmpty(dto.PhoneNumber))
                user.UserProfile.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrEmpty(dto.Address))
                user.UserProfile.Address = dto.Address;

            if (!string.IsNullOrEmpty(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.AvatarUrl))
                user.UserProfile.AvatarUrl = dto.AvatarUrl;

            await _repo.UpdateAdminAsync(user);
            return await _repo.GetAdminByIdAsync(id);
        }


        // ✅ 3. Cập nhật riêng avatar (dùng cho xóa hoặc upload)
        public async Task UpdateAvatarUrlAsync(int adminId, string? newUrl)
        {
            var user = await _repo.GetAdminByIdAsync(adminId);
            if (user == null)
                throw new Exception("Không tìm thấy admin.");

            if (user.UserProfile == null)
                user.UserProfile = new UserProfile();

            user.UserProfile.AvatarUrl = newUrl;

            await _repo.UpdateAdminAsync(user);
        }

        // ✅ 4. Upload avatar mới (và tự động xóa ảnh cũ)
        public async Task<string> UploadAvatarAsync(int adminId, IFormFile file)
        {
            var user = await _repo.GetAdminByIdAsync(adminId);
            if (user == null)
                throw new Exception("Không tìm thấy admin.");

            var oldUrl = user.UserProfile?.AvatarUrl;

            // Upload ảnh mới và xóa ảnh cũ nếu có
            var newUrl = await _cloudinaryService.UploadAvatarImageAsync(file, oldUrl);

            // Cập nhật DB
            await UpdateAvatarUrlAsync(adminId, newUrl);

            return newUrl;
        }

    }
}
