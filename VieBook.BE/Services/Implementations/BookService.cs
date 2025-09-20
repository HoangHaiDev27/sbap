using AutoMapper;
using BusinessObject.Dtos;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
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
        public async Task<List<BookResponseDTO>> GetReadBooksAsync()
        {
            var books = await _bookRepo.GetReadBooksAsync();
            return _mapper.Map<List<BookResponseDTO>>(books);
        }
        public async Task<List<BookResponseDTO>> GetAudioBooksAsync()
        {
            var books = await _bookRepo.GetAudioBooksAsync();
            return _mapper.Map<List<BookResponseDTO>>(books);
        }

        public async Task<BookResponseDTO?> GetAudioBookDetailAsync(int id)
        {
            var book = await _bookRepo.GetAudioBookDetailAsync(id);
            if (book == null) return null;
            return _mapper.Map<BookResponseDTO>(book);
        }

    }
}
