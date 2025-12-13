using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;
using Services.Implementations;
using System.Text.RegularExpressions;
using VieBook.BE.Configuration;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IGoogleAuthService _googleAuthService;
    public AuthController(IAuthService authService, IGoogleAuthService googleAuthService) 
    {
        _authService = authService;
        _googleAuthService = googleAuthService;
    }

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

        if (result == "Email không đúng định dạng")
            return BadRequest(new { message = result });

        if (result == "Email không tồn tại")
            return NotFound(new { message = result });

		// Các trường hợp không được phép tiếp tục Step 2
		if (result == "Tài khoản không được phép sử dụng chức năng quên mật khẩu"
			|| result == "Tài khoản chưa được kích hoạt hoặc đã bị khóa")
		{
			return BadRequest(new { message = result });
		}

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

        if (result != "Đặt lại mật khẩu thành công")
            return BadRequest(new { message = result });

        return Ok(new { message = result });
    }

    [Authorize(Roles = "Admin,Owner,Customer")]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        try
        {
            // Debug: Log all claims
            var claims = User.Claims.ToList();
            Console.WriteLine($"Change Password - Claims count: {claims.Count}");
            foreach (var claim in claims)
            {
                Console.WriteLine($"Change Password - Claim: {claim.Type} = {claim.Value}");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                             ?? User.FindFirst("sub")?.Value;


            Console.WriteLine($"Change Password - User ID from token: {userIdClaim}");
            
            if (string.IsNullOrEmpty(userIdClaim)) 
            {
                Console.WriteLine("Change Password - No user ID found in token");
                return Unauthorized(new { message = "Token không hợp lệ - không tìm thấy user ID" });
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                Console.WriteLine($"Change Password - Cannot parse user ID: {userIdClaim}");
                return Unauthorized(new { message = "User ID không hợp lệ" });
            }

            Console.WriteLine($"Change Password - Parsed user ID: {userId}");
            var result = await _authService.ChangePasswordAsync(userId, request);
            if (result != "Success") return BadRequest(new { message = result });
            return Ok(new { message = "Mật khẩu đã được thay đổi thành công" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Change Password - Exception: {ex.Message}");
            return BadRequest(new { message = ex.Message });
        }
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
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var frontendUrl = ApiConfiguration.FRONTEND_URL;
            var res = await _authService.RegisterAsync(request, frontendUrl);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        var result = await (_authService as AuthService)!.VerifyEmailAsync(token);
        return Ok(new { message = result });
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
    {
        try
        {
            var res = await _googleAuthService.GoogleLoginAsync(request);
            return Ok(res);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            await _authService.RevokeTokenAsync(request.RefreshToken);
            return Ok(new { message = "Token đã được thu hồi" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("active-account")]
    public async Task<IActionResult> ActiveAccount([FromBody] ActiveAccountRequestDto request)
    {
        try
        {
            var result = await _authService.ActiveAccountAsync(request.Email);
            return Ok(new { message = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
