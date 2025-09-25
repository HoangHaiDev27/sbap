using BusinessObject.Dtos;
using BusinessObject.Models;
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
            if (user == null) throw new Exception("Admin not found");

            // chỉ cập nhật các field được phép
            user.UserProfile.FullName = dto.FullName;
            user.UserProfile.AvatarUrl = dto.AvatarUrl;
            user.UserProfile.PhoneNumber = dto.PhoneNumber;

            return await _repo.UpdateAdminAsync(user);
        }

    }
}
