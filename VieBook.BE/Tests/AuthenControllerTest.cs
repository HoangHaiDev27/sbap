﻿// using BusinessObject.Dtos;
// using DataAccess;
// using Microsoft.Extensions.DependencyInjection;
// using Services.Implementations;
// using Services.Interfaces;
// using System.Net.Http.Json;
// using System.Text;
// using Tests;
// using Xunit;
// using Microsoft.Extensions.Configuration;
// using System.Net;


// namespace Tests
// {
//     public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly CustomWebApplicationFactory<Program> _factory;
//         private readonly HttpClient _client;

//         public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
//         {
//             _factory = factory;
//             _client = _factory.CreateClient();
//             SeedTestUser().GetAwaiter().GetResult();
//             SeedCustomerRole().GetAwaiter().GetResult();
//         }

//         private async Task SeedTestUser()
//         {
//             using var scope = _factory.Services.CreateScope();
//             var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//             if (!context.Users.Any(u => u.Email == "alice@viebook.local"))
//             {
//                 var u = new BusinessObject.Models.User
//                 {
//                     Email = "alice@viebook.local",
//                     PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword("OldPass123")),
//                     Status = "Active",
//                     CreatedAt = DateTime.UtcNow
//                 };
//                 context.Users.Add(u);
//                 await context.SaveChangesAsync();
//             }
//         }
//         private async Task SeedCustomerRole()
//         {
//             using var scope = _factory.Services.CreateScope();
//             var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

//             if (!context.Roles.Any(r => r.RoleId == 4))
//             {
//                 context.Roles.Add(new BusinessObject.Models.Role
//                 {
//                     RoleId = 4,
//                     RoleName = "Customer"
//                 });
//                 await context.SaveChangesAsync();
//             }
//         }


//         [Fact]
//         public async Task ForgotPassword_ReturnsMessage_WhenUserExists()
//         {
//             // Arrange
//             var req = new { Email = "alice@viebook.local" };

//             // Act
//             var res = await _client.PostAsJsonAsync("/api/auth/forgot-password", req);

//             // Assert
//             res.EnsureSuccessStatusCode();
//             var json = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();

//             Assert.NotNull(json);
//             Assert.True(json.ContainsKey("message"));
//             Assert.False(string.IsNullOrEmpty(json["message"]));
//         }

//         // [Fact]
//         // public async Task ResetPassword_ReturnsSuccess_WhenOtpValid()
//         // {
//         //     // Giả sử bạn đã seed OTP hoặc mock
//         //     var req = new ResetPasswordRequestDto
//         //     {
//         //         Email = "huonggntt14@gmail.com",
//         //         Otp = "MWKUPT",  // phải trùng OTP đã tạo hoặc mock service trả về
//         //         NewPassword = "NewPass123"
//         //     };

//         //     var res = await _client.PostAsJsonAsync("/api/auth/reset-password", req);
//         //     res.EnsureSuccessStatusCode();

//         //     var json = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();
//         //     Assert.NotNull(json);
//         //     Assert.Equal("Password reset successful", json["message"]);
//         // }
//         [Fact]
//         public async Task Login_ReturnsToken_WhenCredentialsValid()
//         {
//             var req = new
//             {
//                 Email = "alice@viebook.local",
//                 Password = "OldPass123"
//             };

//             var res = await _client.PostAsJsonAsync("/api/auth/login", req);
//             res.EnsureSuccessStatusCode();

//             var json = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
//             Assert.NotNull(json);
//             Assert.True(json.ContainsKey("token") || json.ContainsKey("accessToken"));
//         }

//         [Fact]
//         public async Task Login_ReturnsUnauthorized_WhenPasswordInvalid()
//         {
//             // Arrange
//             var req = new
//             {
//                 Email = "alice@viebook.local",
//                 Password = "WrongPass!"
//             };

//             // Act
//             var res = await _client.PostAsJsonAsync("/api/auth/login", req);

//             // Assert
//             Assert.Equal(System.Net.HttpStatusCode.Unauthorized, res.StatusCode);
//         }
//         [Fact]
//         public async Task Register_ReturnsSuccess_WhenDataValid()
//         {
//             var uniqueEmail = $"newuser_{Guid.NewGuid()}@viebook.local";

//             var req = new RegisterRequestDto
//             {
//                 FullName = "Test User",
//                 Email = uniqueEmail,
//                 Password = "Password123"
//             };

//             var res = await _client.PostAsJsonAsync("/api/auth/register", req);
//             res.EnsureSuccessStatusCode();

//             var json = await res.Content.ReadFromJsonAsync<RegisterResponseDto>();

//             Assert.NotNull(json);
//             Assert.Contains("Vui lòng kiểm tra email", json.Message);
//             Assert.True(json.RequiresEmailConfirmation);
//         }

//         [Fact]
//         public async Task VerifyEmail_ReturnsSuccess_WhenTokenValid()
//         {
//             var email = $"verifyuser_{Guid.NewGuid()}@viebook.local";

//             using (var scope = _factory.Services.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//                 var user = new BusinessObject.Models.User
//                 {
//                     Email = email,
//                     PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword("Password123")),
//                     Status = "Pending",
//                     CreatedAt = DateTime.UtcNow,
//                     UserProfile = new BusinessObject.Models.UserProfile
//                     {
//                         FullName = "Verify User"
//                     }
//                 };
//                 context.Users.Add(user);
//                 await context.SaveChangesAsync();
//             }

//             using var scope2 = _factory.Services.CreateScope();
//             var config = scope2.ServiceProvider.GetRequiredService<IConfiguration>();
//             var jwtService = new JwtService(config);

//             var context2 = scope2.ServiceProvider.GetRequiredService<VieBookContext>();
//             var testUser = context2.Users.First(u => u.Email == email);
//             var token = jwtService.GenerateToken(testUser.UserId.ToString(), testUser.Email);

//             var res = await _client.GetAsync($"/api/auth/verify-email?token={token}");
//             res.EnsureSuccessStatusCode();

//             var json = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();

//             Assert.NotNull(json);
//             Assert.Equal("Email đã được xác thực thành công!", json["message"]);
//         }

//         [Fact]
//         public async Task VerifyOtp_WithValidData_ReturnsOk()
//         {
//             var verifyOtpRequest = new VerifyOtpRequestDto { Email = "test@example.com", Otp = "123456" };

//             var response = await _client.PostAsJsonAsync("/api/auth/verify-otp", verifyOtpRequest);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task VerifyOtp_WithInvalidData_ReturnsBadRequest()
//         {
//             var verifyOtpRequest = new VerifyOtpRequestDto { Email = "test@example.com", Otp = "invalid" };

//             var response = await _client.PostAsJsonAsync("/api/auth/verify-otp", verifyOtpRequest);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//         // [Fact]
//         // public async Task ResetPassword_WithValidData_ReturnsOk()
//         // {
//         //     var resetPasswordRequest = new ResetPasswordRequestDto { Email = "test@example.com", NewPassword = "NewPassword123!", ConfirmPassword = "NewPassword123!" };

//         //     var response = await _client.PostAsJsonAsync("/api/auth/reset-password", resetPasswordRequest);

//         //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         // }

//         // [Fact]
//         // public async Task ResetPassword_WithInvalidData_ReturnsBadRequest()
//         // {
//         //     var resetPasswordRequest = new ResetPasswordRequestDto { Email = "test@example.com", NewPassword = "NewPassword123!", ConfirmPassword = "WrongPassword!" };

//         //     var response = await _client.PostAsJsonAsync("/api/auth/reset-password", resetPasswordRequest);

//         //     Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         // }

//         // [Fact]
//         // public async Task ChangePassword_WithValidData_ReturnsOk()
//         // {
//         //     _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "valid_token");
//         //     var changePasswordRequest = new ChangePasswordRequestDto { CurrentPassword = "CurrentPassword123!", NewPassword = "NewPassword123!", ConfirmPassword = "NewPassword123!" };

//         //     var response = await _client.PostAsJsonAsync("/api/auth/change-password", changePasswordRequest);

//         //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         // }

//         // [Fact]
//         // public async Task ChangePassword_WithInvalidToken_ReturnsUnauthorized()
//         // {
//         //     _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid_token");
//         //     var changePasswordRequest = new ChangePasswordRequestDto { CurrentPassword = "CurrentPassword123!", NewPassword = "NewPassword123!", ConfirmPassword = "NewPassword123!" };

//         //     var response = await _client.PostAsJsonAsync("/api/auth/change-password", changePasswordRequest);

//         //     Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
//         // }

//         [Fact]
//         public async Task Logout_WithValidToken_ReturnsOk()
//         {
//             _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "valid_token");

//             var response = await _client.PostAsync("/api/auth/logout", null);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task Logout_WithInvalidToken_ReturnsUnauthorized()
//         {
//             _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid_token");

//             var response = await _client.PostAsync("/api/auth/logout", null);

//             Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
//         }

//         [Fact]
//         public async Task GoogleLogin_WithValidData_ReturnsOk()
//         {
//             var googleLoginRequest = new GoogleLoginRequestDto { IdToken = "valid_google_id_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/google-login", googleLoginRequest);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task GoogleLogin_WithInvalidData_ReturnsUnauthorized()
//         {
//             var googleLoginRequest = new GoogleLoginRequestDto { IdToken = "invalid_google_id_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/google-login", googleLoginRequest);

//             Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
//         }

//         [Fact]
//         public async Task RefreshToken_WithValidData_ReturnsOk()
//         {
//             var refreshTokenRequest = new RefreshTokenRequestDto { RefreshToken = "valid_refresh_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/refresh-token", refreshTokenRequest);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task RefreshToken_WithInvalidData_ReturnsUnauthorized()
//         {
//             var refreshTokenRequest = new RefreshTokenRequestDto { RefreshToken = "invalid_refresh_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/refresh-token", refreshTokenRequest);

//             Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
//         }

//         [Fact]
//         public async Task RevokeToken_WithValidData_ReturnsOk()
//         {
//             var refreshTokenRequest = new RefreshTokenRequestDto { RefreshToken = "valid_refresh_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/revoke-token", refreshTokenRequest);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task RevokeToken_WithInvalidData_ReturnsBadRequest()
//         {
//             var refreshTokenRequest = new RefreshTokenRequestDto { RefreshToken = "invalid_refresh_token" };

//             var response = await _client.PostAsJsonAsync("/api/auth/revoke-token", refreshTokenRequest);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }


//     }
// }