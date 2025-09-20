using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Text;

namespace Services.Implementations
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly IAuthenRepository _authRepo;
        private readonly IConfiguration _config;
        private readonly JwtService _jwtService;
        private readonly HttpClient _httpClient;

        public GoogleAuthService(IAuthenRepository authRepo, IConfiguration config, JwtService jwtService, HttpClient httpClient)
        {
            _authRepo = authRepo;
            _config = config;
            _jwtService = jwtService;
            _httpClient = httpClient;
        }


        public async Task<LoginResponseDto> GoogleLoginAsync(GoogleLoginRequestDto request)
        {
            try
            {
                Console.WriteLine($"GoogleLoginAsync - Starting with IdToken: {request.IdToken?.Substring(0, 20)}...");
                
                // Verify Google token and get user info
                var googleUser = await VerifyGoogleTokenAsync(request.IdToken);
                Console.WriteLine($"GoogleLoginAsync - Google user verified: {googleUser?.Email}");
                
                if (googleUser == null || !googleUser.EmailVerified)
                {
                    throw new Exception("Token Google không hợp lệ hoặc email chưa được xác thực");
                }

                // Check if user exists in database
                var existingUser = await _authRepo.GetByEmailAsync(googleUser.Email);
                Console.WriteLine($"GoogleLoginAsync - User by email: {existingUser?.UserId}");
                
                // Also check if there's an orphaned ExternalLogin
                var orphanedExternalLogin = await _authRepo.GetExternalLoginByProviderAndKeyAsync("Google", googleUser.Id);
                Console.WriteLine($"GoogleLoginAsync - Orphaned ExternalLogin: {orphanedExternalLogin?.UserId}");
                
                if (existingUser != null)
                {
                    // User exists, check if they have Google login linked
                    var externalLogin = existingUser.ExternalLogins?.FirstOrDefault(el => el.Provider == "Google" && el.ProviderKey == googleUser.Id);
                    
                    if (externalLogin == null)
                    {
                        // Link Google account to existing user
                        var newExternalLogin = new ExternalLogin
                        {
                            UserId = existingUser.UserId,
                            Provider = "Google",
                            ProviderKey = googleUser.Id
                        };
                        
                        // Add external login to user
                        if (existingUser.ExternalLogins == null)
                            existingUser.ExternalLogins = new List<ExternalLogin>();
                        existingUser.ExternalLogins.Add(newExternalLogin);
                        
                        await _authRepo.UpdateAsync(existingUser);
                    }
                }
                else if (orphanedExternalLogin != null)
                {
                    // Handle orphaned ExternalLogin case - create user for existing ExternalLogin
                    Console.WriteLine($"GoogleLoginAsync - Found orphaned ExternalLogin, creating User");
                    existingUser = await HandleOrphanedExternalLoginAsync(googleUser);
                }
                else
                {
                    // Create completely new user
                    var newUser = new User
                    {
                        Email = googleUser.Email,
                        Status = "Active", // Google users are auto-verified
                        CreatedAt = DateTime.UtcNow,
                        LastLoginAt = DateTime.UtcNow,
                        Wallet = 0,
                        ExternalLogins = new List<ExternalLogin>
                        {
                            new ExternalLogin
                            {
                                Provider = "Google",
                                ProviderKey = googleUser.Id
                            }
                        }
                    };

                    // Add Customer role
                    var customerRole = await _authRepo.GetRoleByIdAsync(4);
                    if (customerRole != null)
                    {
                        newUser.Roles = new List<Role> { customerRole };
                    }

                    await _authRepo.CreateAsync(newUser);
                    existingUser = newUser;
                }

                // Update last login
                existingUser.LastLoginAt = DateTime.UtcNow;
                await _authRepo.UpdateAsync(existingUser);

                // Generate JWT token and refresh token
                var token = _jwtService.GenerateToken(existingUser.UserId.ToString(), existingUser.Email);
                var refreshToken = _jwtService.GenerateRefreshToken();

                var userDto = new UserDTO
                {
                    UserId = existingUser.UserId,
                    Email = existingUser.Email,
                    Status = existingUser.Status,
                    CreatedAt = existingUser.CreatedAt,
                    LastLoginAt = existingUser.LastLoginAt,
                    Wallet = existingUser.Wallet
                };

                return new LoginResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    User = userDto,
                    Roles = existingUser.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>()
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi đăng nhập Google: {ex.Message}");
            }
        }

        public async Task<GoogleUserInfoDto> VerifyGoogleTokenAsync(string idToken)
        {
            try
            {
                Console.WriteLine($"VerifyGoogleTokenAsync - Starting verification");
                var clientId = _config["GoogleAuth:ClientId"];
                Console.WriteLine($"VerifyGoogleTokenAsync - ClientId: {clientId}");
                var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";
                Console.WriteLine($"VerifyGoogleTokenAsync - URL: {url}");
                
                var response = await _httpClient.GetAsync(url);
                Console.WriteLine($"VerifyGoogleTokenAsync - Response status: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Token Google không hợp lệ");
                }

                var content = await response.Content.ReadAsStringAsync();
                var tokenInfo = JsonConvert.DeserializeObject<GoogleTokenInfo>(content);

                if (tokenInfo?.aud != clientId)
                {
                    throw new Exception("Token Google không khớp với ứng dụng");
                }

                return new GoogleUserInfoDto
                {
                    Id = tokenInfo.sub,
                    Email = tokenInfo.email,
                    Name = tokenInfo.name,
                    Picture = tokenInfo.picture,
                    EmailVerified = tokenInfo.email_verified
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi xác thực token Google: {ex.Message}");
            }
        }


        private async Task<User> HandleOrphanedExternalLoginAsync(GoogleUserInfoDto googleUser)
        {
            try
            {
                Console.WriteLine($"HandleOrphanedExternalLoginAsync - Creating user for orphaned ExternalLogin");
                
                // Create new user
                var newUser = new User
                {
                    Email = googleUser.Email,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    Wallet = 0,
                    ExternalLogins = new List<ExternalLogin>
                    {
                        new ExternalLogin
                        {
                            Provider = "Google",
                            ProviderKey = googleUser.Id
                        }
                    }
                };

                // Add Customer role
                var customerRole = await _authRepo.GetRoleByIdAsync(4);
                if (customerRole != null)
                {
                    newUser.Roles = new List<Role> { customerRole };
                }

                await _authRepo.CreateAsync(newUser);
                Console.WriteLine($"HandleOrphanedExternalLoginAsync - User created successfully");
                return newUser;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HandleOrphanedExternalLoginAsync - Error: {ex.Message}");
                throw;
            }
        }

        private class GoogleTokenInfo
        {
            public string aud { get; set; } = null!;
            public string sub { get; set; } = null!;
            public string email { get; set; } = null!;
            public string name { get; set; } = null!;
            public string? picture { get; set; }
            public bool email_verified { get; set; }
        }
    }
}
