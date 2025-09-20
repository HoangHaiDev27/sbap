using BusinessObject.Models;
using DataAccess;
using DataAccess.DAO;
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

        public async Task<Book?> GetBookDetailAsync(int id)
        {
            return await _bookDao.GetBookDetailAsync(id);
        }

        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
        {
            return await _bookDao.GetChaptersByBookIdAsync(bookId);
        }
    }
}
