using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var res = await _authService.LoginAsync(request);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    // Step 1: Nhập email
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        var result = await _authService.ForgotPasswordAsync(request);

        if (result == "Invalid email format")
            return BadRequest(new { message = result });

        if (result == "Email not found")
            return NotFound(new { message = result });

        return Ok(new { message = result });
    }


    // Step 2: Verify OTP
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
    {
        var result = await _authService.VerifyOtpAsync(request);

        if (result != "OTP hợp lệ")
            return BadRequest(new { message = result });

        return Ok(new { message = result });
    }

    // Step 3: Reset password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var result = await _authService.ResetPasswordAsync(request);

        if (result != "Password reset successful")
            return BadRequest(new { message = result });

        return Ok(new { message = result });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
        await _authService.LogoutAsync(int.Parse(userIdClaim));
        return Ok(new { message = "Logged out" });
    }
}
