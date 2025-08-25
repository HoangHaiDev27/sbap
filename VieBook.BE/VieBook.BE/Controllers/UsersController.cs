using AutoMapper;
using BusinessObject;
using DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories;
using Services;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        public UsersController(IUserService userService, IMapper mapper)
        {
            _userService = userService;
            _mapper = mapper;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _userService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<UserDTO>>(users));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(_mapper.Map<UserDTO>(user));
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> Postuser(UserDTO dto)
        {
            var user = _mapper.Map<User>(dto);
            await _userService.AddAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, _mapper.Map<UserDTO>(user));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Putuser(int id, UserDTO dto)
        {
            if (id != dto.UserID) return BadRequest();
            var user = _mapper.Map<User>(dto);
            await _userService.UpdateAsync(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Deleteuser(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();
            await _userService.DeleteAsync(user);
            return NoContent();
        }
    }
}
