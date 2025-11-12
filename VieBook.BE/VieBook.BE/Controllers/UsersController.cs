using AutoMapper;
using BusinessObject;
// using BusinessObject.Dtos; // duplicate removal
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using BusinessObject.Dtos;
using BusinessObject.PayOs;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly IWalletTransactionService _walletTransactionService;
        private readonly INotificationService _notificationService;
        private readonly ISubscriptionService _subscriptionService;
        
        public UsersController(IUserService userService, IMapper mapper, IWalletTransactionService walletTransactionService, INotificationService notificationService, ISubscriptionService subscriptionService)
        {
            _userService = userService;
            _mapper = mapper;
            _walletTransactionService = walletTransactionService;
            _notificationService = notificationService;
            _subscriptionService = subscriptionService;
        }

        [Authorize]
        [HttpGet("me1")]
        public async Task<IActionResult> GetMe()
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
                return Ok(new
                {
                    userId = user.UserId,
                    email = user.Email,
                    roles = user.Roles?.Select(r => CapitalizeRole(r.RoleName)).ToList() ?? new List<string>(),
                    wallet = user.Wallet,
                    createdAt = user.CreatedAt,
                    profile = profile == null ? null : new
                    {
                        profile.UserId,
                        profile.FullName,
                        profile.PhoneNumber,
                        profile.DateOfBirth,
                        profile.AvatarUrl,
                        profile.BankNumber,
                        profile.BankName,
                        profile.PortfolioUrl,
                        profile.Bio,
                        profile.AgreeTos,
                        profile.Address
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetMe: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
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

        /// <summary>
        /// Lấy thông tin user hiện tại với profile
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
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
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

                return Ok(new
                {
                    userId = user.UserId,
                    email = user.Email,
                    status = user.Status,
                    createdAt = user.CreatedAt,
                    lastLoginAt = user.LastLoginAt,
                    wallet = user.Wallet,
                    userProfile = user.UserProfile != null ? new
                    {
                        fullName = user.UserProfile.FullName,
                        phoneNumber = user.UserProfile.PhoneNumber,
                        dateOfBirth = user.UserProfile.DateOfBirth,
                        avatarUrl = user.UserProfile.AvatarUrl,
                        bankNumber = user.UserProfile.BankNumber,
                        bankName = user.UserProfile.BankName,
                        isPhoneVerified = user.UserProfile.IsPhoneVerified,
                        phoneVerifiedAt = user.UserProfile.PhoneVerifiedAt,
                        portfolioUrl = user.UserProfile.PortfolioUrl,
                        bio = user.UserProfile.Bio,
                        agreeTos = user.UserProfile.AgreeTos,
                        address = user.UserProfile.Address
                    } : null,
                    roles = user.Roles.Select(r => CapitalizeRole(r.RoleName)).ToList()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetCurrentUser: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
        }

        /// <summary>
        /// Lấy thông tin subscription của user hiện tại
        /// </summary>
        [Authorize]
        [HttpGet("me/subscription")]
        public async Task<IActionResult> GetCurrentUserSubscription()
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

                var subscription = await _userService.GetUserActiveSubscriptionAsync(userId);
                if (subscription == null)
                {
                    return Ok(new { 
                        message = "User không có subscription active", 
                        subscription = (object?)null,
                        memberType = "Thành viên bình thường"
                    });
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
                    memberType = "Thành viên có gói",
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
                Console.WriteLine($"[ERROR] GetCurrentUserSubscription: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
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
                    || string.IsNullOrWhiteSpace(profile.PhoneNumber)
                    || string.IsNullOrWhiteSpace(profile.BankNumber)
                    || string.IsNullOrWhiteSpace(profile.BankName)
                    || profile.AgreeTos == false)
                {
                    return BadRequest(new { message = "Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi trở thành Book Owner" });
                }

                // Phone verification is optional in current setup

                // Thêm role Owner nếu chưa có
                var added = await _userService.AddRoleToUserByNameAsync(userId, "Owner");
                if (!added)
                {
                    return BadRequest(new { message = "Không thể gán quyền Owner cho người dùng" });
                }

                // Reload user to get updated roles
                var refreshed = await _userService.GetByIdWithProfileAndRolesAsync(userId);
                var roleNames = refreshed?.Roles.Select(r => CapitalizeRole(r.RoleName)).ToList() ?? new List<string>();

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
                    dto.BankName,
                    dto.PortfolioUrl,
                    dto.Bio,
                    dto.AgreeTos,
                    dto.Address
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
                        profile.BankName,
                        profile.Address
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] UpsertProfile: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
        }

        /// <summary>
        /// Danh sách plan dành cho Owner (tuần/tháng/năm)
        /// </summary>
        [HttpGet("owner-plans")]
        public async Task<IActionResult> GetOwnerPlans()
        {
            var plans = await _userService.GetPlansByRoleAsync("Owner");
            return Ok(plans.Select(p => new
            {
                p.PlanId,
                p.Name,
                p.Period,
                p.Price,
                p.Currency,
                p.TrialDays,
                p.ConversionLimit
            }));
        }

        /// <summary>
        /// Mua gói Owner: trừ trực tiếp từ ví, yêu cầu role Owner
        /// </summary>
        [Authorize]
        [HttpPost("purchase-plan/{planId:int}")]
        public async Task<IActionResult> PurchaseOwnerPlan(int planId)
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
                if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });
                if (!user.Roles.Any(r => string.Equals(r.RoleName, "Owner", StringComparison.OrdinalIgnoreCase)))
                {
                    return Forbid();
                }

                var plan = await _userService.GetPlanByIdAsync(planId);
                if (plan == null) return NotFound(new { message = "Gói không tồn tại hoặc không hoạt động" });
                if (!string.Equals(plan.ForRole, "Owner", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Gói này không dành cho Owner" });
                }

                // Kiểm tra subscription active hiện tại
                var activeSubscription = await _subscriptionService.GetActiveSubscriptionByUserIdAsync(userId);
                if (activeSubscription != null)
                {
                    var now = DateTime.UtcNow;
                    // Chỉ cho phép mua gói mới nếu:
                    // 1. Gói hiện tại đã hết hạn (EndAt <= now), HOẶC
                    // 2. Gói hiện tại đã hết lượt chuyển đổi (RemainingConversions <= 0)
                    bool canPurchase = now >= activeSubscription.EndAt || activeSubscription.RemainingConversions <= 0;
                    
                    if (!canPurchase)
                    {
                        var daysRemaining = (activeSubscription.EndAt - now).Days;
                        var remainingConversions = activeSubscription.RemainingConversions;
                        return BadRequest(new 
                        { 
                            message = $"Bạn đang có gói '{activeSubscription.Plan?.Name}' còn hiệu lực. " +
                                      $"Gói còn {daysRemaining} ngày và {remainingConversions} lượt chuyển đổi. " +
                                      $"Chỉ có thể mua gói mới khi gói hiện tại hết hạn hoặc hết lượt chuyển đổi." 
                        });
                    }
                }

                // Tính thời gian kết thúc theo period
                DateTime startAt = DateTime.UtcNow;
                DateTime endAt = plan.Period.ToLower() switch
                {
                    "weekly"  => startAt.AddDays(7),
                    "monthly" => startAt.AddMonths(1),
                    "yearly"  => startAt.AddYears(1),
                    _ => startAt.AddMonths(1)
                };

                // Trừ tiền từ ví
                var paid = await _userService.DeductWalletAsync(userId, plan.Price);
                if (!paid)
                {
                    return BadRequest(new { message = "Số dư ví không đủ" });
                }

                // Tạo subscription
                var sub = await _userService.CreateSubscriptionAsync(userId, plan, startAt, endAt);

                // Tạo thông báo cho người dùng
                try
                {
                    string periodMessage = plan.Period.ToLower() switch
                    {
                        "weekly" => "tuần",
                        "monthly" => "tháng",
                        "yearly" => "năm",
                        _ => "kỳ"
                    };

                    await _notificationService.CreateAsync(new CreateNotificationDTO
                    {
                        UserId = userId,
                        Type = NotificationTypes.BOOK_PURCHASE,
                        Title = "Mua gói thành công",
                        Body = $"Bạn đã mua thành công gói \"{plan.Name}\" ({periodMessage}) với giá {plan.Price:N0} xu. Bạn có {plan.ConversionLimit} lượt chuyển đổi sách sang audio. Gói có hiệu lực đến {endAt:dd/MM/yyyy HH:mm}."
                    });
                }
                catch (Exception notifEx)
                {
                    // Log lỗi nhưng không làm gián đoạn flow mua gói
                    Console.WriteLine($"[WARNING] Failed to create notification for plan purchase: {notifEx.Message}");
                }

                return Ok(new
                {
                    message = "Mua gói thành công",
                    subscription = new
                    {
                        sub.SubscriptionId,
                        sub.UserId,
                        sub.PlanId,
                        sub.Status,
                        sub.StartAt,
                        sub.EndAt
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] PurchaseOwnerPlan: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Có lỗi xảy ra" });
            }
        }

        /// <summary>
        /// Lấy lịch sử giao dịch của user hiện tại (kết hợp WalletTransaction và OrderItem)
        /// </summary>
        [Authorize]
        [HttpGet("transaction-history")]
        public async Task<IActionResult> GetUserTransactionHistory()
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

                var history = await _walletTransactionService.GetUserTransactionHistoryAsync(userId);
                return Ok(new Response(0, "Success", history));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUserTransactionHistory: {ex}");
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        /// <summary>
        /// Lấy danh sách giao dịch ví của user hiện tại
        /// </summary>
        [Authorize]
        [HttpGet("wallet-transactions")]
        public async Task<IActionResult> GetUserWalletTransactions()
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

                var transactions = await _walletTransactionService.GetUserTransactionsAsync(userId);
                return Ok(new Response(0, "Success", transactions));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetUserWalletTransactions: {ex}");
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

    }
}
