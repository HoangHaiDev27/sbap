using BusinessObject.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IBookService
    {
        Task<BookDetailDTO?> GetBookDetailAsync(int id);
        Task<List<BookResponseDTO>> GetReadBooksAsync();
    }
}
