using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Services.Implementations
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepo;
        private readonly IMapper _mapper;

        public BookService(IBookRepository bookRepo, IMapper mapper)
        {
            _bookRepo = bookRepo;
            _mapper = mapper;
        }

        public async Task<BookDetailDTO?> GetBookDetailAsync(int id)
        {
            var book = await _bookRepo.GetBookDetailAsync(id);
            if (book == null) return null;
            
            var bookDetailDto = _mapper.Map<BookDetailDTO>(book);
            
            // Check and apply promotion
            await ApplyPromotionToBookDetail(bookDetailDto);
            
            return bookDetailDto;
        }
        public async Task<BookDetailDTO?> GetBookDetail(int id)
        {
            var book = await _bookRepo.GetBookDetail(id);
            if (book == null) return null;
            
            var bookDetailDto = _mapper.Map<BookDetailDTO>(book);
            
            // Check and apply promotion
            await ApplyPromotionToBookDetail(bookDetailDto);
            
            return bookDetailDto;
        }
        public Task<List<Book>> GetAllAsync() => _bookRepo.GetAllAsync();
        public Task<Book?> GetByIdAsync(int id) => _bookRepo.GetByIdAsync(id);
        public Task AddAsync(Book book) => _bookRepo.AddAsync(book);
        public Task UpdateAsync(Book book) => _bookRepo.UpdateAsync(book);
        public Task DeleteAsync(Book book) => _bookRepo.DeleteAsync(book);
        public Task AddCategoriesToBookAsync(int bookId, List<int> categoryIds)
             => _bookRepo.AddCategoriesToBookAsync(bookId, categoryIds);
        public Task<bool> IsIsbnExistsAsync(string isbn)
            => _bookRepo.IsIsbnExistsAsync(isbn);

        public Task<bool> IsIsbnExistsExcludingAsync(string isbn, int excludeBookId)
            => _bookRepo.IsIsbnExistsExcludingAsync(isbn, excludeBookId);

        public Task<List<Book>> GetBooksByOwnerId(int ownerId)
            => _bookRepo.GetBooksByOwnerId(ownerId);

        public Task RemoveCategoriesByBookIdAsync(int bookId)
            => _bookRepo.RemoveCategoriesByBookIdAsync(bookId);
        public async Task<List<BookResponseDTO>> GetReadBooksAsync()
        {
            var books = await _bookRepo.GetReadBooksAsync();
            var bookDtos = _mapper.Map<List<BookResponseDTO>>(books);
            
            // Apply promotion to each book
            foreach (var bookDto in bookDtos)
            {
                await ApplyPromotionToBookResponse(bookDto);
            }
            
            return bookDtos;
        }
        public async Task<List<BookResponseDTO>> GetAudioBooksAsync()
        {
            var books = await _bookRepo.GetAudioBooksAsync();
            var bookDtos = _mapper.Map<List<BookResponseDTO>>(books);
            
            // Apply promotion to each book
            foreach (var bookDto in bookDtos)
            {
                await ApplyPromotionToBookResponse(bookDto);
            }
            
            return bookDtos;
        }

        public async Task<BookResponseDTO?> GetAudioBookDetailAsync(int id)
        {
            var book = await _bookRepo.GetAudioBookDetailAsync(id);
            if (book == null) return null;
            return _mapper.Map<BookResponseDTO>(book);
        }

        public async Task<List<BookSearchReponseDTO?>> SearchBooksAsync(string query)
        {
            return await _bookRepo.SearchBooksAsync(query);
        }
        public async Task<List<Book>> GetTopPurchasedReadBooksByCategoryAsync(int categoryId)
        {
            return await _bookRepo.GetTopPurchasedReadBooksByCategoryAsync(categoryId);
        }
        public async Task<List<Book>> GetTopPurchasedAudioBooksByCategoryAsync(int categoryId)
        {
            return await _bookRepo.GetTopPurchasedAudioBooksByCategoryAsync(categoryId);
        }
        public async Task<List<Book>> GetTopPurchasedAudioBooksAsync()
        {
            return await _bookRepo.GetTopPurchasedAudioBooksAsync();
        }
        public async Task<List<Book>> GetTopPurchasedReadBooksAsync()
        {
            return await _bookRepo.GetTopPurchasedReadBooksAsync();
        }
        public async Task<List<Book>> GetRecommendedBooksAsync(int? userId = null)
        {
            return await _bookRepo.GetRecommendedBooksAsync(userId);
        }

        public async Task<Dictionary<int, decimal>> GetChapterAudioPricesAsync(int bookId)
        {
            return await _bookRepo.GetChapterAudioPricesAsync(bookId);
        }

        public async Task<bool> CheckBookHasActiveChaptersAsync(int bookId)
        {
            return await _bookRepo.CheckBookHasActiveChaptersAsync(bookId);
        }

        public async Task<bool> CheckAllChaptersActiveAsync(int bookId)
        {
            return await _bookRepo.CheckAllChaptersActiveAsync(bookId);
        }

        public async Task<bool> CheckBookHasDraftChaptersAsync(int bookId)
        {
            return await _bookRepo.CheckBookHasDraftChaptersAsync(bookId);
        }

        public async Task UpdateDraftChaptersToInActiveAsync(int bookId)
        {
            await _bookRepo.UpdateDraftChaptersToInActiveAsync(bookId);
        }
        
        private async Task ApplyPromotionToBookDetail(BookDetailDTO bookDetail)
        {
            var promotion = await GetActivePromotionForBook(bookDetail.BookId);
            
            if (promotion != null && promotion.DiscountType == "Percent")
            {
                bookDetail.HasPromotion = true;
                bookDetail.PromotionName = promotion.PromotionName;
                bookDetail.DiscountType = promotion.DiscountType;
                bookDetail.DiscountValue = promotion.DiscountValue;
                
                // Tính giá sau khi áp dụng promotion (chỉ hỗ trợ Percent)
                var discountAmount = bookDetail.TotalPrice * (promotion.DiscountValue / 100);
                bookDetail.DiscountedPrice = bookDetail.TotalPrice - discountAmount;
            }
            else
            {
                bookDetail.HasPromotion = false;
                bookDetail.DiscountedPrice = bookDetail.TotalPrice;
            }
        }
        
        private async Task<Promotion?> GetActivePromotionForBook(int bookId)
        {
            return await _bookRepo.GetActivePromotionForBook(bookId);
        }
        
        private async Task ApplyPromotionToBookResponse(BookResponseDTO bookResponse)
        {
            var promotion = await GetActivePromotionForBook(bookResponse.Id);
            
            if (promotion != null && promotion.DiscountType == "Percent")
            {
                bookResponse.HasPromotion = true;
                bookResponse.PromotionName = promotion.PromotionName;
                bookResponse.DiscountType = promotion.DiscountType;
                bookResponse.DiscountValue = promotion.DiscountValue;
                
                // Tính giá sau khi áp dụng promotion (chỉ hỗ trợ Percent)
                var discountAmount = bookResponse.Price * (promotion.DiscountValue / 100);
                bookResponse.DiscountedPrice = bookResponse.Price - discountAmount;
            }
            else
            {
                bookResponse.HasPromotion = false;
                bookResponse.DiscountedPrice = bookResponse.Price;
            }
        }
    }
}
