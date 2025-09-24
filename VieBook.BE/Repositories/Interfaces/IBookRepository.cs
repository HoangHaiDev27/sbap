using BusinessObject.Dtos;
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
        Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId);
        Task<List<Book>> GetReadBooksAsync();
        Task<List<Book>> GetAudioBooksAsync();
        Task<Book?> GetAudioBookDetailAsync(int id);
        Task<List<BookSearchReponseDTO?>> SearchBooksAsync(string query);
        Task<List<Book>> GetTopPurchasedReadBooksByCategoryAsync(int categoryId);
        Task<List<Book>> GetTopPurchasedAudioBooksByCategoryAsync(int categoryId);
        Task<List<Book>> GetTopPurchasedAudioBooksAsync();
        Task<List<Book>> GetTopPurchasedReadBooksAsync();
        Task<List<Book>> GetRecommendationsForUserAsync(int userId);
    }
}
