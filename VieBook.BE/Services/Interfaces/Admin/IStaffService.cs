using BusinessObject.Dtos;
using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces.Admin
{
    public interface IStaffService
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> AddAsync(User user, string password);
        Task<User> UpdateAsync(User user, string? newPassword = null);
        Task<bool> DeleteAsync(int id);
        Task<bool> LockStaffAsync(int id);
        Task<bool> UnlockStaffAsync(int id);
        Task<bool> ToggleStaffStatusAsync(int id);
    }
}
