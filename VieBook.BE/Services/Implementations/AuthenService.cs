using AutoMapper;
using BCrypt.Net;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repositories.Implementations;
using Repositories.Interfaces;
using Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAuthenRepository _authRepo;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetTokenRepository _tokenRepo;
        private readonly IRefreshTokenRepository _refreshTokenRepo;
        private readonly IConfiguration _config;
        private readonly JwtService _jwtService;
        private readonly IMapper _mapper;

        public AuthService(IAuthenRepository authRepo, IEmailService emailService, IPasswordResetTokenRepository tokenRepo, IRefreshTokenRepository refreshTokenRepo, IConfiguration config, JwtService jwtService, IMapper mapper)
        {
            _authRepo = authRepo;
            _emailService = emailService;
            _tokenRepo = tokenRepo;
            _refreshTokenRepo = refreshTokenRepo;
            _config = config;
            _jwtService = jwtService;
            _mapper = mapper;
        }
        private string GenerateOtp(int length = 6)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null || user.PasswordHash == null)
                throw new Exception("Email hoặc mật khẩu không đúng");

            var storedHash = Encoding.UTF8.GetString(user.PasswordHash);
            if (!BCrypt.Net.BCrypt.Verify(request.Password, storedHash))
                throw new Exception("Email hoặc mật khẩu không đúng");

            // Kiểm tra trạng thái user - chỉ cho phép user có status "Active" đăng nhập
            if (user.Status != "Active")
            {
                if (user.Status == "Pending")
                    throw new Exception("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và bấm vào link xác thực.");
                else if (user.Status == "Banned" || user.Status == "Locked" || user.Status == "NotActive")
                    throw new Exception("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
                else
                    throw new Exception("Tài khoản không được phép đăng nhập. Vui lòng liên hệ quản trị viên.");
            }

            var jwtService = new JwtService(_config);
            var roles = user.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>();
            var token = jwtService.GenerateToken(user.UserId.ToString(), user.Email, roles);
            var refreshToken = jwtService.GenerateRefreshToken();

            try
            {
                // Create and save refresh token
                var refreshTokenEntity = new RefreshToken
                {
                    UserId = user.UserId,
                    TokenHash = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days
                    CreatedAt = DateTime.UtcNow
                };

                var savedRefreshToken = await _refreshTokenRepo.AddAsync(refreshTokenEntity);
                // Get the plain token back from repository
                refreshToken = savedRefreshToken.TokenHash;
            }
            catch (Exception)
            {
                // Continue without refresh token for now
                refreshToken = string.Empty;
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _authRepo.UpdateAsync(user);

            var userDto = new UserDTO
            {
                UserId = user.UserId,
                Email = user.Email,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                Wallet = user.Wallet
            };

            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = userDto,
                Roles = user.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>()
            };
        }
        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            if (!Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return "Email không đúng định dạng";

            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null)
                return "Email không tồn tại";

			// Không cho phép dùng quên mật khẩu cho tài khoản có role Staff
			if (user.Roles != null && user.Roles.Any(r => 
                string.Equals(r.RoleName, "Staff", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(r.RoleName, "Admin", StringComparison.OrdinalIgnoreCase)))
            {
                return "Tài khoản không được phép sử dụng chức năng quên mật khẩu";
            }

            // generate otp
            var otp = GenerateOtp(6);
            var otpHash = BCrypt.Net.BCrypt.HashPassword(otp);

            var token = new PasswordResetToken
            {
                TokenId = Guid.NewGuid(),
                UserId = user.UserId,
                TokenHash = Encoding.UTF8.GetBytes(otpHash),
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                CreatedAt = DateTime.UtcNow
            };

            await _tokenRepo.AddAsync(token);

            await _emailService.SendEmailAsync(user.Email, "Mã xác thực quên mật khẩu",
                $"Mã OTP của bạn là: <b>{otp}</b>. Mã sẽ hết hạn sau 10 phút.");

            return "OTP đã được gửi đến email của bạn";
        }

        public async Task<string> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null) return "Email không tồn tại";

            // Regex check password (>=6 ký tự, có ít nhất 1 chữ và 1 số)
            var passwordRegex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$");
            if (!passwordRegex.IsMatch(request.NewPassword))
                return "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ và số";

            // Hash mật khẩu mới
            user.PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(request.NewPassword));

            await _authRepo.UpdateAsync(user);

            // Đánh dấu token đã dùng (nếu muốn strict)
            var token = await _tokenRepo.GetLatestValidForUserAsync(user.UserId);
            if (token != null)
            {
                token.UsedAt = DateTime.UtcNow;
                await _tokenRepo.UpdateAsync(token);
            }

            return "Đặt lại mật khẩu thành công";
        }
        public async Task LogoutAsync(int userId)
        {
            // Revoke all active refresh tokens for the user
            await _refreshTokenRepo.RevokeAllForUserAsync(userId, "Logout");
        }
        public async Task<string> VerifyOtpAsync(VerifyOtpRequestDto request)
        {
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null) return "Email không tồn tại";

            var token = await _tokenRepo.GetLatestValidForUserAsync(user.UserId);
            if (token == null || token.ExpiresAt < DateTime.UtcNow || token.UsedAt != null)
                return "OTP không hợp lệ hoặc đã hết hạn";

            var otpHash = Encoding.UTF8.GetString(token.TokenHash);
            if (!BCrypt.Net.BCrypt.Verify(request.Otp, otpHash))
                return "OTP không đúng";

            return "OTP hợp lệ";
        }

        public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request, string frontendUrl)
        {
            var existing = await _authRepo.GetByEmailAsync(request.Email);
            if (existing != null)
                throw new Exception("Email đã được sử dụng!");

            // Hash password
            using var sha256 = SHA256.Create();
            var hash = System.Text.Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(request.Password));


            // Map từ DTO → User
            var user = _mapper.Map<User>(request);
            user.PasswordHash = hash;

            // Gán role Customer (RoleId = 4)
            var customerRole = await _authRepo.GetRoleByIdAsync(4); // thêm hàm này trong repo
            if (customerRole == null) throw new Exception("Role Customer không tồn tại!");
            user.Roles.Add(customerRole);

            await _authRepo.CreateAsync(user);

            // Sinh token xác thực email (không có thời hạn)
            var roles = user.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>();
            var token = _jwtService.GenerateVerificationToken(user.UserId.ToString(), user.Email, roles);
            var verifyUrl = $"{frontendUrl}/auth/verify-email?token={token}";

            await _emailService.SendEmailAsync(
                user.Email,
                "Xác thực tài khoản VieBook",
                $@"
                <div style='font-family: Arial, sans-serif; background-color:#1a1a1a; color:#f5f5f5; padding:30px; border-radius:10px; max-width:600px; margin:auto;'>
        
                    <!-- Logo + Text -->
                    <div style='text-align:center; margin-bottom:25px; display:flex; align-items:center; justify-content:center; gap:10px;'>
                        <img src='https://res.cloudinary.com/dfrugzmdt/image/upload/v1759167979/logo_fniaot.png' alt='VieBook Logo' style='height:50px;'/>
                        <span style='font-size:26px; font-weight:bold; color:#ff6600;'>VieBook</span>
                    </div>

                    <!-- Header -->
                    <h2 style='color:#ff6600; text-align:center;'>Xin chào {request.FullName},</h2>

                    <!-- Content -->
                    <p style='font-size:15px; line-height:1.6; text-align:center; margin:20px 0;'>
                        Cảm ơn bạn đã đăng ký VieBook.<br/>
                        Vui lòng xác thực email để kích hoạt tài khoản và bắt đầu hành trình đọc sách cùng chúng tôi.
                    </p>

                    <!-- CTA Button -->
                    <div style='text-align:center; margin:30px 0;'>
                        <a href='{verifyUrl}' 
                           style='background-color:#ff6600; color:#fff; padding:14px 28px; text-decoration:none; 
                                  border-radius:8px; font-size:16px; display:inline-block; font-weight:bold;'>
                            ✅ Xác thực email
                        </a>
                    </div>

                    <!-- Extra note -->
                    <p style='font-size:14px; text-align:center; margin-top:25px; color:#ccc;'>
                        Sau khi xác thực, bạn sẽ có thể khám phá kho sách phong phú và nhận nhiều ưu đãi hấp dẫn từ VieBook 🚀
                    </p>

                    <!-- Footer -->
                    <hr style='border:0; border-top:1px solid #444; margin:30px 20px;'/>
                    <div style='text-align:center; font-size:12px; color:#aaa;'>
                        <p>📚 VieBook - Nền tảng đọc sách trực tuyến</p>
                        <p>Email hỗ trợ: <a href='mailto:support@viebook.com' style='color:#ff6600;'>support@viebook.com</a></p>
                        <p>© 2025 VieBook</p>
                    </div>
                </div>"
            );



            return new RegisterResponseDto
            {
                Message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
                RequiresEmailConfirmation = true
            };
        }


        public async Task<string> VerifyEmailAsync(string token)
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var userId = jwt.Claims.First(c => c.Type == "sub").Value;

            var user = await _authRepo.GetByIdAsync(int.Parse(userId));
            if (user == null) return "Người dùng không tồn tại";

            // Chỉ cho phép verify nếu account đang ở trạng thái "Pending"
            if (user.Status != "Pending")
            {
                if (user.Status == "Active")
                {
                    return "Email đã được xác thực trước đó. Bạn có thể đăng nhập ngay.";
                }
                else
                {
                    return $"Tài khoản đang ở trạng thái '{user.Status}'. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
                }
            }

            // Chỉ đổi status sang "Active" nếu đang là "Pending"
            user.Status = "Active";
            await _authRepo.UpdateAsync(user);

            return "Email đã được xác thực thành công!";
        }


        public async Task<string> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
        {
            var user = await _authRepo.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại");

            // Kiểm tra mật khẩu hiện tại
            if (user.PasswordHash == null)
                throw new Exception("Mật khẩu hiện tại không đúng");

            var storedHash = Encoding.UTF8.GetString(user.PasswordHash);
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, storedHash))
                throw new Exception("Mật khẩu hiện tại không đúng");

            // Cập nhật mật khẩu mới
            var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.PasswordHash = Encoding.UTF8.GetBytes(newPasswordHash);
            await _authRepo.UpdateAsync(user);

            return "Success";
        }

        public async Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var refreshToken = await _refreshTokenRepo.GetByTokenAsync(request.RefreshToken);

            if (refreshToken == null || !refreshToken.IsActive)
                throw new Exception("Refresh token không hợp lệ");

            var user = await _authRepo.GetByIdAsync(refreshToken.UserId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại");

            // Kiểm tra trạng thái user - chỉ cho phép user có status "Active" refresh token
            if (user.Status != "Active")
            {
                // Revoke refresh token nếu user không còn active
                refreshToken.RevokedAt = DateTime.UtcNow;
                refreshToken.ReasonRevoked = $"User status changed to {user.Status}";
                await _refreshTokenRepo.UpdateAsync(refreshToken);

                if (user.Status == "Pending")
                    throw new Exception("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và bấm vào link xác thực.");
                else if (user.Status == "Banned" || user.Status == "Locked" || user.Status == "NotActive")
                    throw new Exception("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
                else
                    throw new Exception("Tài khoản không được phép truy cập. Vui lòng liên hệ quản trị viên.");
            }

            // Generate new tokens
            var roles = user.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>();
            var newToken = _jwtService.GenerateToken(user.UserId.ToString(), user.Email, roles);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Revoke old refresh token
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.ReplacedByToken = newRefreshToken;
            refreshToken.ReasonRevoked = "Replaced";
            await _refreshTokenRepo.UpdateAsync(refreshToken);

            // Create new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.UserId,
                TokenHash = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };

            var savedNewRefreshToken = await _refreshTokenRepo.AddAsync(newRefreshTokenEntity);
            // Get the plain token back from repository
            newRefreshToken = savedNewRefreshToken.TokenHash;

            return new RefreshTokenResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                Roles = roles // Add roles to response for frontend
            };
        }

        public async Task RevokeTokenAsync(string token, string reason = "Revoked")
        {
            var refreshToken = await _refreshTokenRepo.GetByTokenAsync(token);

            if (refreshToken != null && refreshToken.IsActive)
            {
                refreshToken.RevokedAt = DateTime.UtcNow;
                refreshToken.ReasonRevoked = reason;
                await _refreshTokenRepo.UpdateAsync(refreshToken);
            }
        }

        public async Task<string> ActiveAccountAsync(string email)
        {
            var user = await _authRepo.GetByEmailAsync(email);
            if (user == null)
                return "Email không tồn tại";

            user.Status = "Active";
            await _authRepo.UpdateAsync(user);

            return "Tài khoản đã được kích hoạt thành công!";
        }

    }
}
