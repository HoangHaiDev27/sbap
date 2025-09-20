using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO
{
    public class AuthenDAO
    {
        private readonly VieBookContext _context;
        public AuthenDAO(VieBookContext context) => _context = context;

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetByIdAsync(int id) =>
            await _context.Users.FindAsync(id);

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
        public async Task<Role?> GetRoleByIdAsync(int roleId)
        {
            return await _context.Roles.FindAsync(roleId);
        }

        public async Task<ExternalLogin?> GetExternalLoginByProviderAndKeyAsync(string provider, string providerKey)
        {
            return await _context.ExternalLogins
                .FirstOrDefaultAsync(el => el.Provider == provider && el.ProviderKey == providerKey);
        }

        // nếu cần thêm Create/Delete...
    }
}
