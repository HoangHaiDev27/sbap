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
                Task<Book?> GetBookDetailAsync(int id);
                Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId);
                Task<List<Book>> GetReadBooksAsync();
        }
}
