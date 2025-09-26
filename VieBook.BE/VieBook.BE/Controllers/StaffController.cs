using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly IMapper _mapper;

        public StaffController(IUserManagementService userManagementService, IMapper mapper)
        {
            _userManagementService = userManagementService;
            _mapper = mapper;
        }

        // GET: api/staff/book-owners
        [HttpGet("book-owners")]
        public async Task<ActionResult<IEnumerable<UserManagementDTO>>> GetBookOwners()
        {
            try
            {
                Console.WriteLine("[DEBUG] GetBookOwners: Starting...");
                var bookOwners = await _userManagementService.GetBookOwnersAsync();
                Console.WriteLine($"[DEBUG] GetBookOwners: Found {bookOwners.Count} users");
                
                var result = bookOwners.Select(user => new UserManagementDTO
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Wallet = user.Wallet,
                    FullName = user.UserProfile?.FullName,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    Phone = user.UserProfile?.PhoneNumber,
                    Address = "", 
                    RoleName = "Owner",
                    BookCount = user.Books?.Count ?? 0,
                    OrderCount = user.OrderItems?.Count ?? 0
                }).ToList();

                Console.WriteLine($"[DEBUG] GetBookOwners: Returning {result.Count} DTOs");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetBookOwners: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách book owners" });
            }
        }

        // GET: api/staff/customers
        [HttpGet("customers")]
        public async Task<ActionResult<IEnumerable<UserManagementDTO>>> GetCustomers()
        {
            try
            {
                var customers = await _userManagementService.GetCustomersAsync();
                var result = customers.Select(user => new UserManagementDTO
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Wallet = user.Wallet,
                    FullName = user.UserProfile?.FullName,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    Phone = user.UserProfile?.PhoneNumber,
                    Address = "", // UserProfile không có Address
                    RoleName = "Customer",
                    BookCount = user.Books?.Count ?? 0,
                    OrderCount = user.OrderItems?.Count ?? 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetCustomers: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách customers" });
            }
        }

        // GET: api/staff/users/{id}
        [HttpGet("users/{id}")]
        public async Task<ActionResult<UserManagementDTO>> GetUserById(int id)
        {
            try
            {
                var user = await _userManagementService.GetUserWithProfileAsync(id);
                if (user == null)
                    return NotFound(new { message = $"Không tìm thấy user với id = {id}" });

                var result = new UserManagementDTO
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Wallet = user.Wallet,
                    FullName = user.UserProfile?.FullName,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    Phone = user.UserProfile?.PhoneNumber,
                    Address = "", // UserProfile không có Address
                    RoleName = user.Roles?.FirstOrDefault()?.RoleName ?? "Unknown",
                    BookCount = user.Books?.Count ?? 0,
                    OrderCount = user.OrderItems?.Count ?? 0
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUserById: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thông tin user" });
            }
        }

        // PATCH: api/staff/lock-user/{id}
        [HttpPatch("lock-user/{id}")]
        public async Task<IActionResult> LockUser(int id, [FromBody] UserLockRequestDTO? request = null)
        {
            try
            {
                var success = await _userManagementService.LockUserAsync(id);
                if (!success)
                    return NotFound(new { message = $"Không tìm thấy user với id = {id}" });

                return Ok(new { message = "Khóa tài khoản thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] LockUser: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi khóa tài khoản" });
            }
        }

        // PATCH: api/staff/unlock-user/{id}
        [HttpPatch("unlock-user/{id}")]
        public async Task<IActionResult> UnlockUser(int id, [FromBody] UserUnlockRequestDTO? request = null)
        {
            try
            {
                var success = await _userManagementService.UnlockUserAsync(id);
                if (!success)
                    return NotFound(new { message = $"Không tìm thấy user với id = {id}" });

                return Ok(new { message = "Mở khóa tài khoản thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] UnlockUser: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi mở khóa tài khoản" });
            }
        }

        // PATCH: api/staff/toggle-user-status/{id}
        [HttpPatch("toggle-user-status/{id}")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            try
            {
                var success = await _userManagementService.ToggleUserStatusAsync(id);
                if (!success)
                    return NotFound(new { message = $"Không tìm thấy user với id = {id}" });

                return Ok(new { message = "Đổi trạng thái tài khoản thành công" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] ToggleUserStatus: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi đổi trạng thái tài khoản" });
            }
        }

        // GET: api/staff/users-by-role/{roleName}
        [HttpGet("users-by-role/{roleName}")]
        public async Task<ActionResult<IEnumerable<UserManagementDTO>>> GetUsersByRole(string roleName)
        {
            try
            {
                var users = await _userManagementService.GetUsersByRoleAsync(roleName);
                var result = users.Select(user => new UserManagementDTO
                {
                    UserId = user.UserId,
                    Email = user.Email,
                    Status = user.Status,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    Wallet = user.Wallet,
                    FullName = user.UserProfile?.FullName,
                    AvatarUrl = user.UserProfile?.AvatarUrl,
                    Phone = user.UserProfile?.PhoneNumber,
                    Address = "", // UserProfile không có Address
                    RoleName = user.Roles?.FirstOrDefault()?.RoleName ?? "Unknown",
                    BookCount = user.Books?.Count ?? 0,
                    OrderCount = user.OrderItems?.Count ?? 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUsersByRole: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách users theo role" });
            }
        }
    }
}
