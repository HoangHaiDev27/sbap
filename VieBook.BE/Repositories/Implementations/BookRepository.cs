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
        public async Task<Book?> GetBookDetailAsync(int id)
        {
            // Lấy thông tin sách (đã include các navigation cần thiết)
            var book = await _bookDao.GetBookDetailAsync(id);
            if (book == null)
            {
                return null;
            }

            // Thay thế danh sách chapters bằng các chapter có Status = "Active"
            var activeChapters = await _bookDao.GetChaptersActiveByBookIdAsync(id);
            book.Chapters = activeChapters;

            return book;
        }
        public Task<Book?> GetBookDetail(int id) => _bookDao.GetBookDetail(id);
        public Task AddAsync(Book book) => _bookDao.AddAsync(book);
        public Task UpdateAsync(Book book) => _bookDao.UpdateAsync(book);
        public Task DeleteAsync(Book book) => _bookDao.DeleteAsync(book);
        public Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds)
            => _bookDao.AddCategoriesToBookAsync(bookId, categoryIds);
        public Task<bool> IsIsbnExistsAsync(string isbn)
            => _bookDao.IsIsbnExistsAsync(isbn);

        public Task<bool> IsIsbnExistsExcludingAsync(string isbn, int excludeBookId)
            => _bookDao.IsIsbnExistsExcludingAsync(isbn, excludeBookId);

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
        public async Task<List<Book>> GetRecommendedBooksAsync(int? userId = null)
        {
            return await _bookDao.GetRecommendedBooksAsync(userId);
        }

        public async Task<Dictionary<int, decimal>> GetChapterAudioPricesAsync(int bookId)
        {
            return await _bookDao.GetChapterAudioPricesAsync(bookId);
        }

        public async Task<bool> CheckBookHasActiveChaptersAsync(int bookId)
        {
            return await _bookDao.CheckBookHasActiveChaptersAsync(bookId);
        }

        public async Task<bool> CheckAllChaptersActiveAsync(int bookId)
        {
            return await _bookDao.CheckAllChaptersActiveAsync(bookId);
        }

        public async Task<bool> CheckBookHasDraftChaptersAsync(int bookId)
        {
            return await _bookDao.CheckBookHasDraftChaptersAsync(bookId);
        }

        public async Task UpdateDraftChaptersToInActiveAsync(int bookId)
        {
            await _bookDao.UpdateDraftChaptersToInActiveAsync(bookId);
        }
        
        public async Task<Promotion?> GetActivePromotionForBook(int bookId)
        {
            return await _bookDao.GetActivePromotionForBook(bookId);
        }
    }
}
