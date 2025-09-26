using BusinessObject.Models;
using DataAccess;
using DataAccess.DAO.Admin;
using Repositories.Interfaces.Admin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations.Admin
{
    public class StaffRepository : IStaffRepository
    {
        private readonly StaffDAO _staffDAO;

        public StaffRepository(StaffDAO staffDAO)
        {
            _staffDAO = staffDAO;
        }

        public async Task<IEnumerable<User>> GetAllAsync() => await _staffDAO.GetAllAsync();

        public async Task<User?> GetByIdAsync(int id) => await _staffDAO.GetByIdAsync(id);

        public async Task<User> AddAsync(User user) => await _staffDAO.AddAsync(user);
        public async Task<User> UpdateAsync(User user) => await _staffDAO.UpdateAsync(user);

        public async Task<bool> DeleteAsync(int id) => await _staffDAO.DeleteAsync(id);
        public async Task<bool> LockAsync(int id) => await _staffDAO.LockAsync(id);
        public async Task<bool> UnlockAsync(int id) => await _staffDAO.UnlockAsync(id);

    }
}
