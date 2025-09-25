using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO.Admin
{
    public class AdminDAO
    {
        private readonly VieBookContext _context;

        public AdminDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<User?> GetAdminByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == id && u.Roles.Any(r => r.RoleName == "Admin"));
        }

        public async Task<User> UpdateAdminAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
