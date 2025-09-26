using AutoMapper;
using BusinessObject;
// using BusinessObject.Dtos; // duplicate removal
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Attributes;
using VieBook.BE.Constants;
using BusinessObject.Dtos;

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

        /// <summary>
        /// Trở thành Book Owner: yêu cầu hồ sơ cá nhân đầy đủ (FullName, PhoneNumber, BankNumber, BankName)
        /// </summary>
        [Authorize]
        [HttpPost("become-owner")]
        public async Task<IActionResult> BecomeOwner()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token không hợp lệ" });
                }

                var user = await _userService.GetByIdWithProfileAndRolesAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy người dùng" });
                }

                var profile = user.UserProfile;
                if (profile == null
                    || string.IsNullOrWhiteSpace(profile.FullName)
                    || string.IsNullOrWhiteSpace(profile.PhoneNumber)
                    || string.IsNullOrWhiteSpace(profile.BankNumber)
                    || string.IsNullOrWhiteSpace(profile.BankName))
                {
                    return BadRequest(new { message = "Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi trở thành Book Owner" });
                }

                // Thêm role Owner nếu chưa có
                var added = await _userService.AddRoleToUserByNameAsync(userId, "Owner");
                if (!added)
                {
                    return BadRequest(new { message = "Không thể gán quyền Owner cho người dùng" });
                }

                // Reload user to get updated roles
                var refreshed = await _userService.GetByIdWithProfileAndRolesAsync(userId);
                var roleNames = refreshed?.Roles.Select(r => r.RoleName).ToList() ?? new List<string>();

                return Ok(new { message = "Bạn đã trở thành Book Owner", roles = roleNames });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] BecomeOwner: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
        }

        /// <summary>
        /// Cập nhật/khởi tạo hồ sơ cá nhân cho người dùng hiện tại
        /// </summary>
        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpsertProfile([FromBody] UserProfileUpdateDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value
                    ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token không hợp lệ" });
                }

                DateOnly? dob = null;
                if (dto.DateOfBirth.HasValue)
                {
                    dob = DateOnly.FromDateTime(dto.DateOfBirth.Value);
                }

                var profile = await _userService.UpsertUserProfileAsync(
                    userId,
                    dto.FullName,
                    dto.PhoneNumber,
                    dob,
                    dto.AvatarUrl,
                    dto.BankNumber,
                    dto.BankName
                );

                return Ok(new
                {
                    message = "Cập nhật hồ sơ thành công",
                    profile = new
                    {
                        profile.UserId,
                        profile.FullName,
                        profile.PhoneNumber,
                        profile.DateOfBirth,
                        profile.AvatarUrl,
                        profile.BankNumber,
                        profile.BankName
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] UpsertProfile: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
        }
    }
}
