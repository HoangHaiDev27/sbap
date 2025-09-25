using BusinessObject.Models;
using DataAccess;
using DataAccess.DAO.Admin;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces.Admin;
using Services.Interfaces;
using Services.Interfaces.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Services.Implementations.Admin
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepo;
        private readonly VieBookContext _context;
        private readonly StaffDAO _staffDAO;
        private readonly IEmailService _emailService;
        private readonly CloudinaryService _cloudinaryService;
        public StaffService(IStaffRepository staffRepo, VieBookContext context, StaffDAO staffDAO, IEmailService emailService, CloudinaryService cloudinaryService)
        {
            _staffRepo = staffRepo;
            _context = context;
            _staffDAO = staffDAO;
            _emailService = emailService;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<IEnumerable<User>> GetAllAsync() => await _staffRepo.GetAllAsync();

        public async Task<User?> GetByIdAsync(int id) => await _staffRepo.GetByIdAsync(id);

        public async Task<User> AddAsync(User user, string password)
        {
            // Validate email format
            if (!Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new Exception("Email không hợp lệ");

            // Validate password
            var passwordRegex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$");
            if (!passwordRegex.IsMatch(password))
                throw new Exception("Password phải >=6 ký tự, có chữ cái và số");

            // Kiểm tra email tồn tại
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
                throw new Exception("Email đã tồn tại");

            // Kiểm tra ngày sinh hợp lệ
            var dob = user.UserProfile?.DateOfBirth;
            if (dob.HasValue && dob.Value > DateOnly.FromDateTime(DateTime.UtcNow))
                throw new Exception("Ngày sinh không hợp lệ");

            // Gán role Staff
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Staff");
            if (role == null) throw new Exception("Role 'Staff' không tồn tại");
            user.Roles.Clear();
            user.Roles.Add(role);

            user.Status = "Active";
            user.CreatedAt = DateTime.UtcNow;

            // Hash mật khẩu
            user.PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(password));

            // Đảm bảo UserProfile không null
            user.UserProfile ??= new UserProfile();
            user.UserProfile.FullName = user.UserProfile.FullName;
            user.UserProfile.AvatarUrl = user.UserProfile.AvatarUrl;
            user.UserProfile.DateOfBirth = dob;

            // Lưu xuống DB
            var newStaff = await _staffDAO.AddAsync(user);

            // Gửi email thông báo
            var subject = "Tài khoản Staff của bạn trên VieBook";
            var body = $@"
                <p>Xin chào {user.UserProfile?.FullName ?? user.Email},</p>
                <p>Bạn đã được admin tạo tài khoản staff trên hệ thống VieBook.</p>
                <p><b>Email đăng nhập:</b> {user.Email}</p>
                <p><b>Mật khẩu:</b> {password}</p>
                <p>Vui lòng đăng nhập để làm việc.</p>
                <p>Trân trọng,<br/>VieBook Team</p>";
            await _emailService.SendEmailAsync(user.Email, subject, body);

            return newStaff;
        }


        public async Task<User> UpdateAsync(User user, string? newPassword = null)
        {
            var existingUser = await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == user.UserId);

            if (existingUser == null)
                throw new Exception("Staff không tồn tại");

            // Validate email
            if (!Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new Exception("Email không hợp lệ");

            // Kiểm tra email trùng
            var emailConflict = await _context.Users.AnyAsync(u => u.Email == user.Email && u.UserId != user.UserId);
            if (emailConflict)
                throw new Exception("Email đã tồn tại");

            // Kiểm tra ngày sinh hợp lệ
            var dob = user.UserProfile?.DateOfBirth;
            if (dob.HasValue && dob.Value > DateOnly.FromDateTime(DateTime.UtcNow))
                throw new Exception("Ngày sinh không hợp lệ");

            // Cập nhật thông tin
            existingUser.Email = user.Email;
            existingUser.UserProfile ??= new UserProfile();
            existingUser.UserProfile.FullName = user.UserProfile?.FullName ?? existingUser.UserProfile.FullName;
            existingUser.UserProfile.AvatarUrl = user.UserProfile?.AvatarUrl ?? existingUser.UserProfile.AvatarUrl;
            existingUser.UserProfile.DateOfBirth = dob ?? existingUser.UserProfile.DateOfBirth;

            // Cập nhật mật khẩu nếu có
            if (!string.IsNullOrWhiteSpace(newPassword))
            {
                var passwordRegex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$");
                if (!passwordRegex.IsMatch(newPassword))
                    throw new Exception("Password phải >=6 ký tự, có chữ cái và số");

                existingUser.PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(newPassword));

                // Gửi email thông báo đổi mật khẩu
                var subject = "Mật khẩu Staff của bạn trên VieBook đã được thay đổi";
                var body = $@"
                    <p>Xin chào {existingUser.UserProfile?.FullName ?? existingUser.Email},</p>
                    <p>Admin đã cập nhật tài khoản staff của bạn trên VieBook.</p>
                    <p><b>Email đăng nhập:</b> {existingUser.Email}</p>
                    <p><b>Mật khẩu mới:</b> {newPassword}</p>
                    <p>Vui lòng đăng nhập để tiếp tục làm việc.</p>
                    <p>Trân trọng,<br/>VieBook Team</p>";
                await _emailService.SendEmailAsync(existingUser.Email, subject, body);
            }

            await _staffDAO.UpdateAsync(existingUser);
            return existingUser;
        }




        public async Task<bool> DeleteAsync(int id) => await _staffRepo.DeleteAsync(id);
        public async Task<bool> LockStaffAsync(int id)
        {
            return await _staffRepo.LockAsync(id);
        }

        public async Task<bool> UnlockStaffAsync(int id)
        {
            return await _staffRepo.UnlockAsync(id);
        }

        public async Task<bool> ToggleStaffStatusAsync(int id)
        {
            var staff = await _staffRepo.GetByIdAsync(id);
            if (staff == null) return false;

            if (staff.Status == "Active")
                return await _staffRepo.LockAsync(id);
            else
                return await _staffRepo.UnlockAsync(id);
        }
    }
}
