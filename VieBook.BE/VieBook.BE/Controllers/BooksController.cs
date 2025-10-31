using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Services.Implementations;
using Services.Interfaces;
using Services.Interfaces.Staff;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IMapper _mapper;
        private readonly IBookApprovalService _bookApprovalService;

        public BooksController(IBookService bookService, IMapper mapper, IBookApprovalService bookApprovalService)
        {
            _bookService = bookService;
            _mapper = mapper;
            _bookApprovalService = bookApprovalService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BookDetailDTO>> GetBookDetail(int id)
        {
            var book = await _bookService.GetBookDetailAsync(id);
            if (book == null)
                return NotFound();

            return Ok(book);
        }
        // GET api/book/detail/{id} full status
        [HttpGet("detail/{id:int}")]
        public async Task<ActionResult<BookDetailDTO>> GetBookDetailById(int id)
        {
            var book = await _bookService.GetBookDetail(id);
            if (book == null)
            {
                return NotFound(new { message = $"Không tìm thấy sách với ID {id}" });
            }

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

            // BookApproval sẽ được tạo sau khi owner submit sách để review
            // Không tự động tạo khi tạo sách

            return Ok(new { bookId = book.BookId });
        }


        // update
        [HttpPut("{id:int}")]
        public async Task<IActionResult> PutBook(int id, UpdateBookDTO dto)
        {
            try
            {
                if (id != dto.BookId)
                    return BadRequest("Id không khớp.");

                var existing = await _bookService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound();

                // Check ISBN duplication if ISBN is provided
                if (!string.IsNullOrWhiteSpace(dto.Isbn) && dto.Isbn != existing.Isbn)
                {
                    var isbnExists = await _bookService.IsIsbnExistsExcludingAsync(dto.Isbn, id);
                    if (isbnExists)
                    {
                        return Conflict("ISBN đã tồn tại");
                    }
                }

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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Cập nhật sách thất bại: {ex.Message}" });
            }
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
        // PATCH: api/books/{id}/completion-status
        [HttpPatch("{id:int}/completion-status")]
        public async Task<IActionResult> UpdateCompletionStatus(int id, [FromBody] UpdateCompletionStatusDTO dto)
        {
            try
            {
                var book = await _bookService.GetByIdAsync(id);
                if (book == null)
                    return NotFound();

                book.CompletionStatus = dto.CompletionStatus;

                // Cập nhật UploadStatus nếu có
                if (!string.IsNullOrEmpty(dto.UploadStatus))
                {
                    book.UploadStatus = dto.UploadStatus;
                }

                book.UpdatedAt = DateTime.UtcNow;

                await _bookService.UpdateAsync(book);
                return Ok(new { message = "Book status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/books/{bookId}/chapters/audio-prices
        [HttpGet("{bookId:int}/chapters/audio-prices")]
        public async Task<IActionResult> GetChapterAudioPrices(int bookId)
        {
            try
            {
                var audioPrices = await _bookService.GetChapterAudioPricesAsync(bookId);
                return Ok(audioPrices);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

        // GET: api/books/{bookId}/check-active-chapters
        [HttpGet("{bookId:int}/check-active-chapters")]
        public async Task<IActionResult> CheckActiveChapters(int bookId)
        {
            try
            {
                var hasActiveChapters = await _bookService.CheckBookHasActiveChaptersAsync(bookId);
                return Ok(new { hasActiveChapters });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/books/{bookId}/status
        [HttpPatch("{bookId:int}/status")]
        public async Task<IActionResult> UpdateBookStatus(int bookId, [FromBody] UpdateBookStatusDTO dto)
        {
            try
            {
                var book = await _bookService.GetByIdAsync(bookId);
                if (book == null)
                    return NotFound();

                book.Status = dto.Status;
                book.UpdatedAt = DateTime.UtcNow;

                await _bookService.UpdateAsync(book);
                return Ok(new { message = "Book status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/books/{bookId}/check-all-chapters-active
        [HttpGet("{bookId:int}/check-all-chapters-active")]
        public async Task<IActionResult> CheckAllChaptersActive(int bookId)
        {
            try
            {
                var allChaptersActive = await _bookService.CheckAllChaptersActiveAsync(bookId);
                return Ok(new { hasAllActive = allChaptersActive });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

        // GET: api/books/{bookId}/check-draft-chapters
        [HttpGet("{bookId:int}/check-draft-chapters")]
        public async Task<IActionResult> CheckDraftChapters(int bookId)
        {
            try
            {
                var hasDraftChapters = await _bookService.CheckBookHasDraftChaptersAsync(bookId);
                return Ok(new { hasDraftChapters });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/books/{bookId}/update-draft-chapters-to-inactive
        [HttpPut("{bookId:int}/update-draft-chapters-to-inactive")]
        public async Task<IActionResult> UpdateDraftChaptersToInActive(int bookId)
        {
            try
            {
                await _bookService.UpdateDraftChaptersToInActiveAsync(bookId);
                return Ok(new { message = "Draft chapters updated to InActive successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
