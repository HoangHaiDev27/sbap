using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces.Admin
{
    public interface IAdminRepository
    {
        Task<User?> GetAdminByIdAsync(int id);
        Task<User> UpdateAdminAsync(User user);
    }
}
