using BusinessObject;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
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
    }
}
