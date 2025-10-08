using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO.Admin
{
    public class StaffDAO
    {
        private readonly VieBookContext _context;

        public StaffDAO(VieBookContext context)
        {
            _context = context;
        }

        // Lấy tất cả Staff
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .Where(u => 
                    u.Roles.Count == 1 && 
                    u.Roles.Any(r => r.RoleName == "Staff")
                )
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        // Lấy Staff theo Id
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id
                    && u.Roles.Any(r => r.RoleName == "Staff"));
        }

        // Thêm Staff (gán role staff)
        public async Task<User> AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Update Staff
        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        // Xóa Staff dựa vào UserId
       public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                // Bỏ qua các global query filter (nếu có) để lấy user bất kể Status
                var user = await _context.Users
                    .IgnoreQueryFilters()
                    .Include(u => u.Roles)
                    .FirstOrDefaultAsync(u => u.UserId == id);

                if (user == null) return false;

                // Xóa UserRoles liên quan
                var userRoles = _context.Set<Dictionary<string, object>>("UserRole")
                    .Where(ur => (int)ur["UserId"] == id);
                _context.RemoveRange(userRoles);

                // Xóa UserProfile liên quan
                var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == id);
                if (profile != null) _context.UserProfiles.Remove(profile);

                // TODO: Xóa các bảng khác liên quan nếu cần
                // VD: Orders, Logs, Comments... tùy DB schema

                // Xóa chính User
                _context.Users.Remove(user);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Xóa thất bại: " + ex.Message);
                return false;
            }
        }


        // Thay đổi trạng thái Staff
        public async Task<bool> SetStatusAsync(int id, string status)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return false;

                user.Status = status; // "Active" hoặc "NotActive"
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Thay đổi trạng thái thất bại: " + ex.Message);
                return false;
            }
        }

        // Hoặc viết riêng hai phương thức tiện lợi:
        public async Task<bool> LockAsync(int id) => await SetStatusAsync(id, "NotActive");
        public async Task<bool> UnlockAsync(int id) => await SetStatusAsync(id, "Active");
    }
}

