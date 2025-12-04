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
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;

        public StaffController(IUserManagementService userManagementService, IMapper mapper, IEmailService emailService, IUserService userService)
        {
            _userManagementService = userManagementService;
            _mapper = mapper;
            _emailService = emailService;
            _userService = userService;
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
                    // OrderCount for book owners = số chapter đã bán (order items của các chapter thuộc sách của owner)
                    OrderCount = user.Books?
                        .SelectMany(b => b.Chapters)
                        .SelectMany(c => c.OrderItems)
                        .Count(oi => oi.PaidAt != null) ?? 0
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
                    // BookCount cho customer = số sách khác nhau đã mua (tính từ order items đã thanh toán)
                    BookCount = user.OrderItems?
                        .Where(oi => oi.PaidAt != null)
                        .Select(oi => oi.Chapter?.BookId)
                        .Where(bookId => bookId.HasValue)
                        .Distinct()
                        .Count() ?? 0,
                    // OrderCount = số chương đã mua (order items đã thanh toán)
                    OrderCount = user.OrderItems?.Count(oi => oi.PaidAt != null) ?? 0
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetCustomers: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách customers" });
            }
        }

        // GET: api/staff/users/{id}/subscription
        [HttpGet("users/{id}/subscription")]
        public async Task<ActionResult> GetUserSubscription(int id)
        {
            try
            {
                var subscription = await _userService.GetUserActiveSubscriptionAsync(id);
                if (subscription == null)
                {
                    return Ok(new { message = "User không có subscription active", subscription = (object?)null });
                }

                return Ok(new
                {
                    subscriptionId = subscription.SubscriptionId,
                    userId = subscription.UserId,
                    planId = subscription.PlanId,
                    status = subscription.Status,
                    autoRenew = subscription.AutoRenew,
                    startAt = subscription.StartAt,
                    endAt = subscription.EndAt,
                    remainingConversions = subscription.RemainingConversions,
                    cancelAt = subscription.CancelAt,
                    createdAt = subscription.CreatedAt,
                    plan = new
                    {
                        planId = subscription.Plan.PlanId,
                        name = subscription.Plan.Name,
                        forRole = subscription.Plan.ForRole,
                        period = subscription.Plan.Period,
                        price = subscription.Plan.Price,
                        currency = subscription.Plan.Currency,
                        trialDays = subscription.Plan.TrialDays,
                        conversionLimit = subscription.Plan.ConversionLimit,
                        status = subscription.Plan.Status
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUserSubscription: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy thông tin subscription" });
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

                var roleName = user.Roles?.FirstOrDefault()?.RoleName ?? "Unknown";
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
                    RoleName = roleName,
                    BookCount = user.Books?.Count ?? 0,
                    // OrderCount: nếu là Owner thì tính số chapter đã bán, nếu không thì tính order items của user
                    OrderCount = roleName == "Owner" 
                        ? (user.Books?
                            .SelectMany(b => b.Chapters)
                            .SelectMany(c => c.OrderItems)
                            .Count(oi => oi.PaidAt != null) ?? 0)
                        : (user.OrderItems?.Count ?? 0)
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
                var result = users.Select(user => {
                    var roleName = user.Roles?.FirstOrDefault()?.RoleName ?? "Unknown";
                    return new UserManagementDTO
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
                        RoleName = roleName,
                        BookCount = user.Books?.Count ?? 0,
                        // OrderCount: nếu là Owner thì tính số chapter đã bán, nếu không thì tính order items của user
                        OrderCount = roleName == "Owner" 
                            ? (user.Books?
                                .SelectMany(b => b.Chapters)
                                .SelectMany(c => c.OrderItems)
                                .Count(oi => oi.PaidAt != null) ?? 0)
                            : (user.OrderItems?.Count ?? 0)
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUsersByRole: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi lấy danh sách users theo role" });
            }
        }

        // POST: api/staff/send-email
        [HttpPost("send-email")]
        public async Task<IActionResult> SendEmail([FromForm] SendEmailRequest request)
        {
            try
            {
                Console.WriteLine($"[DEBUG] SendEmail: To={request.To}, Subject={request.Subject}");
                
                // Validation
                if (string.IsNullOrWhiteSpace(request.To))
                {
                    return BadRequest(new { message = "Email người nhận không được để trống" });
                }
                
                if (string.IsNullOrWhiteSpace(request.Subject))
                {
                    return BadRequest(new { message = "Tiêu đề email không được để trống" });
                }
                
                if (string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest(new { message = "Nội dung email không được để trống" });
                }

                // Save attachment if provided
                string? attachmentPath = null;
                if (request.Attachment != null && request.Attachment.Length > 0)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "email-attachments");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    
                    var fileName = $"{Guid.NewGuid()}_{request.Attachment.FileName}";
                    attachmentPath = Path.Combine(uploadsFolder, fileName);
                    
                    using (var stream = new FileStream(attachmentPath, FileMode.Create))
                    {
                        await request.Attachment.CopyToAsync(stream);
                    }
                }

                // Send email using EmailService
                await _emailService.SendEmailAsync(
                    request.To, 
                    request.Cc, 
                    request.Subject, 
                    request.Message, 
                    attachmentPath
                );
                
                Console.WriteLine($"[DEBUG] SendEmail: Email sent successfully to {request.To}");
                
                return Ok(new { 
                    message = "Email đã được gửi thành công",
                    to = request.To,
                    subject = request.Subject,
                    sentAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] SendEmail: {ex}");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi gửi email" });
            }
        }
    }

    public class SendEmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string? Cc { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public IFormFile? Attachment { get; set; }
    }
}
