using BusinessObject.Dtos;
using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces.Admin
{
    public interface IAdminService
    {
        Task<User> GetProfileAsync(int id);
        Task<User> UpdateProfileAsync(int id, AdminProfileDTO dto);
    }
}
