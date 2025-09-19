using BusinessObject.Models;
using DataAccess;
using DataAccess.DAO;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class BookRepository : IBookRepository
    {
        private readonly BookDao _bookDao;
        public BookRepository(BookDao bookDao)
        {
            _bookDao = bookDao;
        }
        public Task<List<Book>> GetAllAsync() => _bookDao.GetAllAsync();
        public Task<Book?> GetByIdAsync(int id) => _bookDao.GetByIdAsync(id);
        public Task<Book?> GetBookDetailAsync(int id) => _bookDao.GetBookDetailAsync(id);
        public Task AddAsync(Book book) => _bookDao.AddAsync(book);
        public Task UpdateAsync(Book book) => _bookDao.UpdateAsync(book);
        public Task DeleteAsync(Book book) => _bookDao.DeleteAsync(book);
        public Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds)
            => _bookDao.AddCategoriesToBookAsync(bookId, categoryIds);
        public Task<bool> IsIsbnExistsAsync(string isbn)
            => _bookDao.IsIsbnExistsAsync(isbn);

        public Task<List<Book>> GetBooksByOwnerId(int ownerId)
            => _bookDao.GetBooksByOwnerId(ownerId);

        public Task RemoveCategoriesByBookIdAsync(int bookId)
            => _bookDao.RemoveCategoriesByBookIdAsync(bookId);
    }
}
