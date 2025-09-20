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
            return _mapper.Map<BookDetailDTO>(book);
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

        public Task<List<Book>> GetBooksByOwnerId(int ownerId)
            => _bookRepo.GetBooksByOwnerId(ownerId);

        public Task RemoveCategoriesByBookIdAsync(int bookId)
            => _bookRepo.RemoveCategoriesByBookIdAsync(bookId);
        public async Task<List<BookResponseDTO>> GetReadBooksAsync()
        {
            var books = await _bookRepo.GetReadBooksAsync();
            return _mapper.Map<List<BookResponseDTO>>(books);
        }
    }
}
