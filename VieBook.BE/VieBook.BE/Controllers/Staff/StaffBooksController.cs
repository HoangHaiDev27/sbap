using AutoMapper;
using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers.Staff
{
    [Route("api/staff/[controller]")]
    [ApiController]
    public class StaffBooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly IMapper _mapper;

        public StaffBooksController(IBookService bookService, IMapper mapper)
        {
            _bookService = bookService;
            _mapper = mapper;
        }

        // GET: api/staff/staffbooks?page=1&pageSize=10&searchTerm=...&statusFilter=...&categoryId=...
        [HttpGet]
        public async Task<ActionResult<object>> GetBooksPaged(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? statusFilter = null,
            [FromQuery] int? categoryId = null)
        {
            try
            {
                var (books, totalCount) = await _bookService.GetAllForStaffPagedAsync(page, pageSize, searchTerm, statusFilter, categoryId);

                return Ok(new
                {
                    data = books,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/staff/staffbooks/stats?searchTerm=...&statusFilter=...&categoryId=...
        [HttpGet("stats")]
        public async Task<ActionResult<Dictionary<string, int>>> GetStats(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? statusFilter = null,
            [FromQuery] int? categoryId = null)
        {
            try
            {
                var stats = await _bookService.GetStatsForStaffAsync(searchTerm, statusFilter, categoryId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

