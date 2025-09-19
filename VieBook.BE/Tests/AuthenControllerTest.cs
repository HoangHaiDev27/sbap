﻿using BusinessObject.Dtos;
using DataAccess;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Text;
using Xunit;
using Tests;


public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(CustomWebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        SeedTestUser().GetAwaiter().GetResult();
    }

    private async Task SeedTestUser()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
        if (!context.Users.Any(u => u.Email == "alice@viebook.local"))
        {
            var u = new BusinessObject.Models.User
            {
                Email = "alice@viebook.local",
                PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword("OldPass123")),
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(u);
            await context.SaveChangesAsync();
        }
    }

    [Fact]
    public async Task ForgotPassword_ReturnsMessage_WhenUserExists()
    {
        // Arrange
        var req = new { Email = "alice@viebook.local" };

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/forgot-password", req);

        // Assert
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();

        Assert.NotNull(json);
        Assert.True(json.ContainsKey("message"));
        Assert.False(string.IsNullOrEmpty(json["message"]));
    }

    // [Fact]
    // public async Task ResetPassword_ReturnsSuccess_WhenOtpValid()
    // {
    //     // Giả sử bạn đã seed OTP hoặc mock
    //     var req = new ResetPasswordRequestDto
    //     {
    //         Email = "huonggntt14@gmail.com",
    //         Otp = "MWKUPT",  // phải trùng OTP đã tạo hoặc mock service trả về
    //         NewPassword = "NewPass123"
    //     };

    //     var res = await _client.PostAsJsonAsync("/api/auth/reset-password", req);
    //     res.EnsureSuccessStatusCode();

    //     var json = await res.Content.ReadFromJsonAsync<Dictionary<string, string>>();
    //     Assert.NotNull(json);
    //     Assert.Equal("Password reset successful", json["message"]);
    // }
    [Fact]
    public async Task Login_ReturnsToken_WhenCredentialsValid()
    {
        var req = new
        {
            Email = "alice@viebook.local",
            Password = "OldPass123"
        };

        var res = await _client.PostAsJsonAsync("/api/auth/login", req);
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadFromJsonAsync<Dictionary<string, object>>();
        Assert.NotNull(json);
        Assert.True(json.ContainsKey("token") || json.ContainsKey("accessToken"));
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenPasswordInvalid()
    {
        // Arrange
        var req = new
        {
            Email = "alice@viebook.local",
            Password = "WrongPass!"
        };

        // Act
        var res = await _client.PostAsJsonAsync("/api/auth/login", req);

        // Assert
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, res.StatusCode);
    }

}