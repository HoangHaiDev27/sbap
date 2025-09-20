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
        private readonly IConfiguration _config;
        private readonly JwtService _jwtService;
        private readonly IMapper _mapper;

        public AuthService(IAuthenRepository authRepo, IEmailService emailService, IPasswordResetTokenRepository tokenRepo, IConfiguration config, JwtService jwtService, IMapper mapper)
        {
            _authRepo = authRepo;
            _emailService = emailService;
            _tokenRepo = tokenRepo;
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

            var jwtService = new JwtService(_config);
            var token = jwtService.GenerateToken(user.UserId.ToString(), user.Email);

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
                User = userDto,
                Roles = user.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>()
            };
        }
        public async Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            if (!Regex.IsMatch(request.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                return "Invalid email format";

            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null)
                return "Email not found";

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
            if (user == null) return "Email not found";

            // Regex check password (>=6 ký tự, có ít nhất 1 chữ và 1 số)
            var passwordRegex = new Regex(@"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$");
            if (!passwordRegex.IsMatch(request.NewPassword))
                return "Password phải có ít nhất 6 ký tự, gồm chữ và số";

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

            return "Password reset successful";
        }
        public Task LogoutAsync(int userId)
        {
            // Stateless JWT: client discards token. Reserved for future blacklist/revocation if needed.
            return Task.CompletedTask;
        }
        public async Task<string> VerifyOtpAsync(VerifyOtpRequestDto request)
        {
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null) return "Email not found";

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

            // Sinh token xác thực email
            var token = _jwtService.GenerateToken(user.UserId.ToString(), user.Email);
            var verifyUrl = $"{frontendUrl}/auth/verify-email?token={token}";

            await _emailService.SendEmailAsync(user.Email, "Xác thực tài khoản VieBook",
                $"<p>Xin chào {request.FullName},</p>" +
                $"<p>Vui lòng click vào link sau để kích hoạt tài khoản:</p>" +
                $"<a href='{verifyUrl}'>Xác thực email</a>");

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

            user.Status = "Active";
            await _authRepo.UpdateAsync(user);

            return "Email đã được xác thực thành công!";
        }


    }
}
