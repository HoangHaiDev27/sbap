using BusinessObject.Models;
using DataAccess.DAO.Admin;
using Repositories.Interfaces.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations.Admin
{
    public class AdminRepository : IAdminRepository
    {
        private readonly AdminDAO _dao;

        public AdminRepository(AdminDAO dao)
        {
            _dao = dao;
        }

        public async Task<User?> GetAdminByIdAsync(int id)
            => await _dao.GetAdminByIdAsync(id);

        public async Task<User> UpdateAdminAsync(User user)
            => await _dao.UpdateAdminAsync(user);
    }
}
