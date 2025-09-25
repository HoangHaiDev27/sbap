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
        [HttpGet("{id}/related")]
        public async Task<ActionResult<IEnumerable<BookResponseDTO>>> GetRelatedBooks(int id)
        {
            var currentBook = await _bookService.GetBookDetailAsync(id);
            if (currentBook == null)
                return NotFound("Không tìm thấy sách.");

            // Lấy category đầu tiên (nếu có)
            var mainCategory = currentBook.Categories.FirstOrDefault();
            if (string.IsNullOrEmpty(mainCategory))
                return Ok(new List<BookResponseDTO>()); // không có category thì trả rỗng

            var allBooks = await _bookService.GetAllAsync();

            var relatedBooks = allBooks
                .Where(b => b.BookId != id &&
                            b.Categories.Any(c => c.Name == mainCategory)) // so sánh theo tên category
                .Take(6)
                .ToList();

            return Ok(_mapper.Map<IEnumerable<BookResponseDTO>>(relatedBooks));
        }
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<BookSearchReponseDTO>>> SearchBooks([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Ok(new List<BookSearchReponseDTO>());

            var books = await _bookService.SearchBooksAsync(query);
            return Ok(books);
        }
        [HttpGet("top-read/category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetTopPurchasedReadBooksByCategory(int categoryId)
        {
            var books = await _bookService.GetTopPurchasedReadBooksByCategoryAsync(categoryId);
            if (books == null || !books.Any())
                return NotFound("Không có sách đọc nào.");
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
        [HttpGet("top-audio/category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetTopPurchasedAudioBooksByCategory(int categoryId)
        {
            var books = await _bookService.GetTopPurchasedAudioBooksByCategoryAsync(categoryId);
            if (books == null || !books.Any())
                return NotFound("Không có sách audio nào.");
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
        [HttpGet("top-audio")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetTopPurchasedAudioBooks()
        {
            var books = await _bookService.GetTopPurchasedAudioBooksAsync();
            if (books == null || !books.Any())
                return NotFound("Không có sách audio nào.");
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
        [HttpGet("top-read")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetTopPurchasedReadBooks()
        {
            var books = await _bookService.GetTopPurchasedReadBooksAsync();
            if (books == null || !books.Any())
                return NotFound("Không có sách đọc nào.");
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }

        // GET: api/books/recommendations?userId=123
        [HttpGet("recommendations")]
        public async Task<ActionResult<IEnumerable<BookDTO>>> GetRecommendedBooks([FromQuery] int? userId)
        {
            var books = await _bookService.GetRecommendedBooksAsync(userId);
            if (books == null || !books.Any())
                return NotFound("Không có sách đề xuất nào.");
            return Ok(_mapper.Map<IEnumerable<BookDTO>>(books));
        }
    }
}
