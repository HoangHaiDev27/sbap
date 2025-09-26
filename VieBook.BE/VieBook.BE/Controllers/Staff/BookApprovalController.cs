using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces.Staff;

namespace VieBook.BE.Controllers.Staff
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookApprovalController : ControllerBase
    {
        private readonly IBookApprovalService _service;
        private readonly IMapper _mapper;

        public BookApprovalController(IBookApprovalService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        // Lấy tất cả BookApproval
        [HttpGet]
        public async Task<ActionResult<List<BookApprovalDTO>>> GetAll()
        {
            var list = await _service.GetAllAsync();
            var dtoList = _mapper.Map<List<BookApprovalDTO>>(list);
            return Ok(dtoList);
        }

        // Lấy BookApproval theo Id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookApprovalDTO>> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();

            var dto = _mapper.Map<BookApprovalDTO>(item);
            return Ok(dto);
        }

        // Thêm mới BookApproval
        [HttpPost]
        public async Task<ActionResult<BookApprovalDTO>> Add([FromBody] BookApproval bookApproval)
        {
            await _service.AddAsync(bookApproval);

            var dto = _mapper.Map<BookApprovalDTO>(bookApproval);
            return CreatedAtAction(nameof(GetById), new { id = bookApproval.ApprovalId }, dto);
        }

        // Duyệt (Approve)
        [HttpPut("approve/{bookId:int}")]
        public async Task<ActionResult> Approve(int bookId, [FromQuery] int staffId)
        {
            await _service.ApproveAsync(bookId, staffId);
            return Ok(new { message = "Book has been approved."});
        }

        // Từ chối (Refuse)
        [HttpPut("refuse/{bookId:int}")]
        public async Task<ActionResult> Refuse(int bookId, [FromQuery] int staffId, [FromQuery] string? reason = null)
        {
            await _service.RefuseAsync(bookId, staffId, reason);
            return Ok(new { message = "Book has been refused."});
        }


        // Lấy BookApproval mới nhất theo BookId
        [HttpGet("latest/{bookId:int}")]
        public async Task<ActionResult<BookApprovalDTO>> GetLatestByBookId(int bookId)
        {
            var latest = await _service.GetLatestByBookIdAsync(bookId);
            if (latest == null) return NotFound();

            var dto = _mapper.Map<BookApprovalDTO>(latest);
            return Ok(dto);
        }

        // Lấy tất cả sách có Status = "Active"
        [HttpGet("active-books")]
        public async Task<ActionResult<List<BookDTO>>> GetAllActiveBooks()
        {
            var activeBooks = await _service.GetAllActiveAsync();
            var activeBookDtos = _mapper.Map<List<BookDTO>>(activeBooks);

            return Ok(activeBookDtos);
        }
        // GET users
        [HttpGet("users")]
        public async Task<ActionResult<List<UserNameDTO>>> GetAllUsersWithProfile()
        {
            var users = await _service.GetAllUsersWithProfileAsync();
            var userDtos = _mapper.Map<List<UserNameDTO>>(users);

            return Ok(userDtos);
        }
    }
}
