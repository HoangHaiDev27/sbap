using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Services.Implementations;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IMapper _mapper;
        public BooksController(IBookService bookService, IMapper mapper)
        {
            _bookService = bookService;
            _mapper = mapper;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDetailDTO>> GetBookDetail(int id)
        {
            var book = await _bookService.GetBookDetailAsync(id);
            if (book == null)
                return NotFound();

            return Ok(book);
        }

        // get all
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetBooks()
        {
            var books = await _bookService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
        // add
        [HttpPost]
        public async Task<ActionResult> PostBook(BookDTO dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Isbn))
            {
                var exists = await _bookService.IsIsbnExistsAsync(dto.Isbn);
                if (exists)
                {
                    return Conflict("ISBN đã tồn tại");
                }
            }

            var book = _mapper.Map<Book>(dto);
            book.CreatedAt = DateTime.UtcNow;

            await _bookService.AddAsync(book);
            await _bookService.AddCategoriesToBookAsync(book.BookId, dto.CategoryIds);

            return Ok(true);
        }


        // update
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutBook(int id, BookDTO dto)
        {
            if (id != dto.BookId)
                return BadRequest("Id không khớp.");

            var existing = await _bookService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            var currentOwnerId = existing.OwnerId;

            _mapper.Map(dto, existing);

            existing.OwnerId = currentOwnerId;
            existing.UpdatedAt = DateTime.UtcNow;

            await _bookService.UpdateAsync(existing);

            // Xử lý lại categories
            await _bookService.RemoveCategoriesByBookIdAsync(id);
            if (dto.CategoryIds != null && dto.CategoryIds.Any())
            {
                await _bookService.AddCategoriesToBookAsync(id, dto.CategoryIds);
            }

            return NoContent();
        }


        // delete
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _bookService.GetByIdAsync(id);
            if (book == null)
                return NotFound();

            await _bookService.DeleteAsync(book);
            return NoContent();
        }
        // GET: api/books/owner/{ownerId}
        [HttpGet("owner/{ownerId:int}")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetBooksByOwner(int ownerId)
        {
            var books = await _bookService.GetBooksByOwnerId(ownerId);
            if (books == null || books.Count == 0)
            {
                return NotFound("Không tìm thấy sách nào cho Owner này.");
            }

            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
        // GET: api/readbooks
        [HttpGet("read")]
        public async Task<ActionResult<List<BookResponseDTO>>> GetReadBooks()
        {
            var books = await _bookService.GetReadBooksAsync();

            if (books == null || !books.Any())
                return NotFound("Không có sách đọc nào.");

            return Ok(books);
        }
        // GET: api/books/audio
        [HttpGet("audio")]
        public async Task<ActionResult<List<BookResponseDTO>>> GetAudioBooks()
        {
            var books = await _bookService.GetAudioBooksAsync();
            if (books == null || !books.Any())
                return NotFound("Không có sách audio nào.");
            return Ok(books);
        }

        // GET: api/books/audio/{id}
        [HttpGet("audio/{id}")]
        public async Task<ActionResult<BookResponseDTO>> GetAudioBookDetail(int id)
        {
            var book = await _bookService.GetAudioBookDetailAsync(id);
            if (book == null)
                return NotFound();
            return Ok(book);
        }

    }
}
