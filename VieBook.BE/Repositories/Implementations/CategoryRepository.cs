using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly CategoryDAO _categoryDAO;

        public CategoryRepository(CategoryDAO categoryDAO)
        {
            _categoryDAO = categoryDAO;
        }

        public Task<List<Category>> GetAllAsync() => _categoryDAO.GetAllAsync();

        public Task<Category?> GetByIdAsync(int id) => _categoryDAO.GetByIdAsync(id);

        public Task AddAsync(Category category) => _categoryDAO.AddAsync(category);

        public Task UpdateAsync(Category category) => _categoryDAO.UpdateAsync(category);

        public Task DeleteAsync(Category category) => _categoryDAO.DeleteAsync(category);

        public Task<List<Category>> GetChildrenAsync(int parentId) => _categoryDAO.GetChildrenAsync(parentId);

        public Task<bool> IsNameExistsAsync(string name, int? excludeId = null) => _categoryDAO.IsNameExistsAsync(name, excludeId);

        public Task<Category?> GetByIdWithBooksAsync(int id) => _categoryDAO.GetByIdWithBooksAsync(id);
    }
}
