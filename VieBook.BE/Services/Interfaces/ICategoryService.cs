using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task DeleteAsync(Category category);
        Task<List<Category>> GetChildrenAsync(int parentId);
        Task<bool> IsNameExistsAsync(string name, int? excludeId = null);
    }
}
