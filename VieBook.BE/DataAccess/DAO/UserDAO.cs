using BusinessObject;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess
{
    public class UserDAO
    {
        private readonly VieBookContext _context;
        public UserDAO(VieBookContext context)
        {
            _context = context;
        }
        public async Task<List<User>> GetAllAsync() => await _context.Users.ToListAsync();

        public async Task<User?> GetByIdAsync(int id) => await _context.Users.FindAsync(id);

        public async Task<User?> GetByIdWithProfileAndRolesAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> GetByEmailAsync(string email) => await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task UpdateWalletBalanceAsync(int userId, decimal amount)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.Wallet += amount;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> AddRoleToUserByNameAsync(int userId, string roleName)
        {
            var user = await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role == null) return false;

            if (!user.Roles.Any(r => r.RoleId == role.RoleId))
            {
                user.Roles.Add(role);
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName)
        {
            var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                profile = new UserProfile
                {
                    UserId = userId,
                    FullName = fullName,
                    PhoneNumber = phoneNumber,
                    DateOfBirth = dateOfBirth,
                    AvatarUrl = avatarUrl,
                    BankNumber = bankNumber,
                    BankName = bankName
                };
                _context.UserProfiles.Add(profile);
            }
            else
            {
                if (fullName != null) profile.FullName = fullName;
                if (phoneNumber != null) profile.PhoneNumber = phoneNumber;
                if (dateOfBirth.HasValue) profile.DateOfBirth = dateOfBirth.Value;
                if (avatarUrl != null) profile.AvatarUrl = avatarUrl;
                if (bankNumber != null) profile.BankNumber = bankNumber;
                if (bankName != null) profile.BankName = bankName;
                _context.UserProfiles.Update(profile);
            }
            await _context.SaveChangesAsync();
            return profile;
        }
    }
}
