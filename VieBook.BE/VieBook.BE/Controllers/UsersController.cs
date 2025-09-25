using AutoMapper;
using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Attributes;
using VieBook.BE.Constants;

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
        // [Authorize]
        // [RequirePermission(Permissions.ViewUsers)]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<UserDTO>>(users));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUsers: {ex}");
                throw;
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(_mapper.Map<UserDTO>(user));
        }
        [HttpGet("email")]
        public async Task<ActionResult<UserDTO>> GetUserByEmail(string email)
        {
            var user = await _userService.GetByEmailAsync(email);
            if (user == null) return NotFound();
            return Ok(_mapper.Map<UserDTO>(user));
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> PostUser(UserDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("User data is required.");
                }

                // validate email
                if (string.IsNullOrWhiteSpace(dto.Email))
                {
                    return BadRequest("Email is required.");
                }

                try
                {
                    var mail = new System.Net.Mail.MailAddress(dto.Email);
                    if (mail.Address != dto.Email)
                    {
                        return BadRequest("Invalid email format.");
                    }
                }
                catch
                {
                    return BadRequest("Invalid email format.");
                }

                // map and save
                var user = _mapper.Map<User>(dto);
                await _userService.AddAsync(user);

                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, _mapper.Map<UserDTO>(user));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] PostUser: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the user.");
            }
        }


        // [HttpPut("{id}")]
        // public async Task<IActionResult> Putuser(int id, UserDTO dto)
        // {
        //     if (id != dto.UserID) return BadRequest();
        //     var user = _mapper.Map<User>(dto);
        //     await _userService.UpdateAsync(user);
        //     return NoContent();
        // }

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
