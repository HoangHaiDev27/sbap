using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<string> ResetPasswordAsync(ResetPasswordRequestDto request);
        Task LogoutAsync(int userId);
        Task<string> VerifyOtpAsync(VerifyOtpRequestDto request);
    }
}
