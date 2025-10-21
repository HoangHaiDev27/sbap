using BusinessObject;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Linq;
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

        public async Task<List<User>> GetUsersByRoleAsync(string roleName)
        {
            Console.WriteLine($"[DEBUG] UserDAO.GetUsersByRoleAsync: Looking for role '{roleName}'");

            var users = await _context.Users
                .Include(u => u.Roles)
                .Include(u => u.UserProfile)
                .Include(u => u.Books)
                .Include(u => u.OrderItems)
                .Where(u => u.Roles.Any(r => r.RoleName == roleName))
                .ToListAsync();

            Console.WriteLine($"[DEBUG] UserDAO.GetUsersByRoleAsync: Found {users.Count} users with role '{roleName}'");
            foreach (var user in users)
            {
                Console.WriteLine($"[DEBUG] User: {user.Email}, Roles: {string.Join(", ", user.Roles.Select(r => r.RoleName))}");
            }

            return users;
        }

        public async Task<User?> GetUserWithProfileAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .Include(u => u.Books)
                .Include(u => u.OrderItems)
                .FirstOrDefaultAsync(u => u.UserId == userId);
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

        public async Task<UserProfile> UpsertUserProfileAsync(int userId, string? fullName, string? phoneNumber, DateOnly? dateOfBirth, string? avatarUrl, string? bankNumber, string? bankName, string? portfolioUrl = null, string? bio = null, bool? agreeTos = null, string? address = null)
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
                    BankName = bankName,
                    PortfolioUrl = portfolioUrl,
                    Bio = bio,
                    AgreeTos = agreeTos ?? false,
                    Address = address
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
                if (portfolioUrl != null) profile.PortfolioUrl = portfolioUrl;
                if (bio != null) profile.Bio = bio;
                if (agreeTos.HasValue) profile.AgreeTos = agreeTos.Value;
                if (address != null) profile.Address = address;
                _context.UserProfiles.Update(profile);
            }
            await _context.SaveChangesAsync();
            return profile;
        }

        // Plans & Subscriptions helpers
        public async Task<List<Plan>> GetPlansByRoleAsync(string forRole)
        {
            return await _context.Plans
                .Where(p => p.ForRole == forRole && p.Status == "Active")
                .OrderBy(p => p.Price)
                .ToListAsync();
        }

        public async Task<Plan?> GetPlanByIdAsync(int planId)
        {
            return await _context.Plans.FirstOrDefaultAsync(p => p.PlanId == planId && p.Status == "Active");
        }

        public async Task<Subscription> CreateSubscriptionAsync(int userId, Plan plan, DateTime startAt, DateTime endAt)
        {
            var sub = new Subscription
            {
                UserId = userId,
                PlanId = plan.PlanId,
                Status = "Active",
                AutoRenew = false,
                StartAt = startAt,
                EndAt = endAt,
                CreatedAt = DateTime.UtcNow
            };
            // set remaining conversions if column exists
            sub.RemainingConversions = plan.ConversionLimit;

            _context.Subscriptions.Add(sub);
            await _context.SaveChangesAsync();
            return sub;
        }

        public async Task<bool> DeductWalletAsync(int userId, decimal amount)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return false;
            if (user.Wallet < amount) return false;
            user.Wallet -= amount;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Subscription?> GetUserActiveSubscriptionAsync(int userId)
        {
            return await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId && s.Status == "Active")
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();
        }
    }
}
