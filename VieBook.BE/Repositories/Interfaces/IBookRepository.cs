using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IBookRepository
    {
        Task<List<Book>> GetAllAsync();
        Task<Book?> GetByIdAsync(int id);
        Task<Book?> GetBookDetailAsync(int id);
        Task AddAsync(Book book);
        Task UpdateAsync(Book book);
        Task DeleteAsync(Book book);
        Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds);
        Task RemoveCategoriesByBookIdAsync(int bookId);
        Task<bool> IsIsbnExistsAsync(string isbn);
        Task<List<Book>> GetBooksByOwnerId(int ownerId);
    }
}
