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
        private readonly IRefreshTokenRepository _refreshTokenRepo;
        private readonly IConfiguration _config;
        private readonly JwtService _jwtService;
        private readonly HttpClient _httpClient;

        public GoogleAuthService(IAuthenRepository authRepo, IRefreshTokenRepository refreshTokenRepo, IConfiguration config, JwtService jwtService, HttpClient httpClient)
        {
            _authRepo = authRepo;
            _refreshTokenRepo = refreshTokenRepo;
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
                    Console.WriteLine($"GoogleLoginAsync - Found existing user: {existingUser.Email}, Status: {existingUser.Status}");
                    
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
                        Console.WriteLine($"GoogleLoginAsync - Added Google login to existing user");
                    }
                    
                    // Kiểm tra trạng thái user trước khi cho phép đăng nhập
                    Console.WriteLine($"GoogleLoginAsync - Checking status: {existingUser.Status}");
                    if (existingUser.Status == "Banned" || existingUser.Status == "Locked" || existingUser.Status == "NotActive")
                    {
                        Console.WriteLine($"GoogleLoginAsync - User is banned/locked, denying access");
                        throw new Exception("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");
                    }
                    
                    // Tự động active account khi login bằng Google (chỉ nếu status là Pending)
                    if (existingUser.Status == "Pending" || existingUser.Status == "pending")
                    {
                        Console.WriteLine($"GoogleLoginAsync - Status is Pending, changing to Active");
                        existingUser.Status = "Active";
                        Console.WriteLine($"GoogleLoginAsync - Auto-activated user {existingUser.Email}, new status: {existingUser.Status}");
                    }
                    else
                    {
                        Console.WriteLine($"GoogleLoginAsync - Status is already {existingUser.Status}, no change needed");
                    }
                    
                    Console.WriteLine($"GoogleLoginAsync - Updating user in database...");
                    await _authRepo.UpdateAsync(existingUser);
                    Console.WriteLine($"GoogleLoginAsync - User updated successfully");
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
                    
                    // Reload user with roles from database to ensure roles are loaded
                    existingUser = await _authRepo.GetByEmailAsync(googleUser.Email);
                    if (existingUser == null)
                    {
                        throw new Exception("Không thể tải thông tin user sau khi tạo");
                    }
                }

                // Update last login
                existingUser.LastLoginAt = DateTime.UtcNow;
                await _authRepo.UpdateAsync(existingUser);

                // Get roles for JWT token
                var roles = existingUser.Roles?.Select(r => r.RoleName).ToList() ?? new List<string>();
                
                // Generate JWT token and refresh token with roles
                var token = _jwtService.GenerateToken(existingUser.UserId.ToString(), existingUser.Email, roles);
                var refreshToken = _jwtService.GenerateRefreshToken();

                // Save refresh token to database
                try
                {
                    var refreshTokenEntity = new RefreshToken
                    {
                        UserId = existingUser.UserId,
                        TokenHash = refreshToken,
                        ExpiresAt = DateTime.UtcNow.AddDays(7), // 7 days
                        CreatedAt = DateTime.UtcNow
                    };

                    var savedRefreshToken = await _refreshTokenRepo.AddAsync(refreshTokenEntity);
                    // Get the plain token back from repository
                    refreshToken = savedRefreshToken.TokenHash;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"GoogleLoginAsync - Failed to save refresh token: {ex.Message}");
                    // Continue without refresh token for now, but log the error
                    refreshToken = string.Empty;
                }

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
                
                // Reload user with roles from database to ensure roles are loaded
                var reloadedUser = await _authRepo.GetByEmailAsync(googleUser.Email);
                if (reloadedUser == null)
                {
                    throw new Exception("Không thể tải thông tin user sau khi tạo");
                }
                
                Console.WriteLine($"HandleOrphanedExternalLoginAsync - User created successfully");
                return reloadedUser;
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
