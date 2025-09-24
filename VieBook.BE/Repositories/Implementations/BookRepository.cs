using BusinessObject.Dtos;
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

        public async Task<List<Chapter>> GetChaptersByBookIdAsync(int bookId)
        {
            return await _bookDao.GetChaptersByBookIdAsync(bookId);
        }
        public async Task<List<Book>> GetReadBooksAsync()
        {
            return await _bookDao.GetReadBooksAsync();
        }
        public async Task<List<Book>> GetAudioBooksAsync()
        {
            return await _bookDao.GetAudioBooksAsync();
        }

        public async Task<Book?> GetAudioBookDetailAsync(int id)
        {
            return await _bookDao.GetAudioBookDetailAsync(id);
        }
        public async Task<List<BookSearchReponseDTO?>> SearchBooksAsync(string query)
        {
            return await _bookDao.SearchBooksAsync(query);
        }
        public async Task<List<Book>> GetTopPurchasedReadBooksByCategoryAsync(int categoryId)
        {
            return await _bookDao.GetTopPurchasedReadBooksByCategoryAsync(categoryId);
        }
        public async Task<List<Book>> GetTopPurchasedAudioBooksByCategoryAsync(int categoryId)
        {
            return await _bookDao.GetTopPurchasedAudioBooksByCategoryAsync(categoryId);
        }
        public async Task<List<Book>> GetTopPurchasedAudioBooksAsync()
        {
            return await _bookDao.GetTopPurchasedAudioBooksAsync();
        }
        public async Task<List<Book>> GetTopPurchasedReadBooksAsync()
        {
            return await _bookDao.GetTopPurchasedReadBooksAsync();
        }
        public async Task<List<Book>> GetRecommendationsForUserAsync(int userId)
        {
            return await _bookDao.GetRecommendationsForUserAsync(userId);
        }
    }
}
