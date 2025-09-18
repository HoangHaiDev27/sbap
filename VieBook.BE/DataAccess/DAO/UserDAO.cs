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
    }
}
