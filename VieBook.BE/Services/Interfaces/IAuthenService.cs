using BusinessObject.Dtos;
using BusinessObject.Models;
using Services.Implementations;
using System.Text;

namespace Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<string> ResetPasswordAsync(ResetPasswordRequestDto request);
        Task<string> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
        Task LogoutAsync(int userId);
        Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request, string frontendUrl);
        Task<string> VerifyEmailAsync(string token);
        Task<string> VerifyOtpAsync(VerifyOtpRequestDto request);
        Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
        Task RevokeTokenAsync(string token, string reason = "Revoked");
    }
}
