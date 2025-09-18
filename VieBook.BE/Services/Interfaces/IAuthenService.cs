using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IAuthService
    {
        Task<string> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<string> ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
