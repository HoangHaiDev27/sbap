using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class CategoryDAO
    {
        private readonly VieBookContext _context;

        public CategoryDAO(VieBookContext context)
        {
            _context = context;
        }

        // get all Category
        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories
                .Include(c => c.Books)
                .ToListAsync();
        }

        // get Category by Id
        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories
                .Include(c => c.Parent)
                .Include(c => c.InverseParent)
                .FirstOrDefaultAsync(c => c.CategoryId == id);
        }

        // get Category by Id with Books
        public async Task<Category?> GetByIdWithBooksAsync(int id)
        {
            return await _context.Categories
                .Include(c => c.Parent)
                .Include(c => c.InverseParent)
                .Include(c => c.Books)
                .FirstOrDefaultAsync(c => c.CategoryId == id);
        }

        // add
        public async Task AddAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
        }

        // update
        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }

        // delete
        public async Task DeleteAsync(Category category)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }

        // Lấy danh sách Category con của một Category cha
        public async Task<List<Category>> GetChildrenAsync(int parentId)
        {
            return await _context.Categories
                .Where(c => c.ParentId == parentId)
                .ToListAsync();
        }

        // Kiểm tra tên category có trùng lặp không
        public async Task<bool> IsNameExistsAsync(string name, int? excludeId = null)
        {
            var query = _context.Categories.Where(c => c.Name == name);

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.CategoryId != excludeId.Value);
            }

            return await query.AnyAsync();
        }

    }
}
