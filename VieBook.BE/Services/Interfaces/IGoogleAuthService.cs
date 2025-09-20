using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IGoogleAuthService
    {
        Task<LoginResponseDto> GoogleLoginAsync(GoogleLoginRequestDto request);
        Task<GoogleUserInfoDto> VerifyGoogleTokenAsync(string idToken);
    }
}
