using BusinessObject.Models;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepo;

        public CategoryService(ICategoryRepository categoryRepo)
        {
            _categoryRepo = categoryRepo;
        }

        public Task<List<Category>> GetAllAsync() => _categoryRepo.GetAllAsync();

        public Task<Category?> GetByIdAsync(int id) => _categoryRepo.GetByIdAsync(id);

        public Task AddAsync(Category category) => _categoryRepo.AddAsync(category);

        public Task UpdateAsync(Category category) => _categoryRepo.UpdateAsync(category);

        public Task DeleteAsync(Category category) => _categoryRepo.DeleteAsync(category);

        public Task<List<Category>> GetChildrenAsync(int parentId) => _categoryRepo.GetChildrenAsync(parentId);
    }
}
