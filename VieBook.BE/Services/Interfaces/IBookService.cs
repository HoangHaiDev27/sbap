using BusinessObject.Dtos;
using BusinessObject.Models;
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
        Task<BookDetailDTO?> GetBookDetail(int id);
        Task<List<Book>> GetAllAsync();
        Task<Book?> GetByIdAsync(int id);
        Task AddAsync(Book book);
        Task UpdateAsync(Book book);
        Task DeleteAsync(Book book);
        Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds);
        Task RemoveCategoriesByBookIdAsync(int bookId);
        Task<bool> IsIsbnExistsAsync(string isbn);
        Task<List<Book>> GetBooksByOwnerId(int ownerId);
        Task<List<BookResponseDTO>> GetReadBooksAsync();
        Task<List<BookResponseDTO>> GetAudioBooksAsync();
        Task<BookResponseDTO?> GetAudioBookDetailAsync(int id);
        Task<List<BookSearchReponseDTO?>> SearchBooksAsync(string query);
        Task<List<Book>> GetTopPurchasedReadBooksByCategoryAsync(int categoryId);
        Task<List<Book>> GetTopPurchasedAudioBooksByCategoryAsync(int categoryId);
        Task<List<Book>> GetTopPurchasedAudioBooksAsync();
        Task<List<Book>> GetTopPurchasedReadBooksAsync();
        Task<List<Book>> GetRecommendedBooksAsync(int? userId = null);
        Task<Dictionary<int, decimal>> GetChapterAudioPricesAsync(int bookId);
        Task<bool> CheckBookHasActiveChaptersAsync(int bookId);
        Task<bool> CheckAllChaptersActiveAsync(int bookId);
        Task<bool> CheckBookHasDraftChaptersAsync(int bookId);
        Task UpdateDraftChaptersToInActiveAsync(int bookId);
    }
}
