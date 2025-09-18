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

namespace Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAuthenRepository _authRepo;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetTokenRepository _tokenRepo;
        private readonly IConfiguration _config;

        public AuthService(IAuthenRepository authRepo, IEmailService emailService, IPasswordResetTokenRepository tokenRepo, IConfiguration config)
        {
            _authRepo = authRepo;
            _emailService = emailService;
            _tokenRepo = tokenRepo;
            _config = config;
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
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null)
                throw new Exception("Email not found");

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
                $"Mã xác thực của bạn là: <b>{otp}</b>. Mã sẽ hết hạn sau 10 phút.");

            return otp; // hoặc JWT/Token nếu bạn muốn trả token
        }


        public async Task<string> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            var user = await _authRepo.GetByEmailAsync(request.Email);
            if (user == null) return "Email not found";

            var token = await _tokenRepo.GetLatestValidForUserAsync(user.UserId);
            if (token == null || token.ExpiresAt < DateTime.UtcNow || token.UsedAt != null)
                return "OTP không hợp lệ hoặc đã hết hạn";

            var otpHash = System.Text.Encoding.UTF8.GetString(token.TokenHash);
            if (!BCrypt.Net.BCrypt.Verify(request.Otp, otpHash))
                return "OTP không đúng";

            user.PasswordHash = System.Text.Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(request.NewPassword));
            await _authRepo.UpdateAsync(user);

            token.UsedAt = DateTime.UtcNow;
            await _tokenRepo.UpdateAsync(token);

            return "Success";
        }


        public Task LogoutAsync(int userId)
        {
            // Stateless JWT: client discards token. Reserved for future blacklist/revocation if needed.
            return Task.CompletedTask;
        }

    }
}
