using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        try
        {
            var jwt = await _authService.ForgotPasswordAsync(request);
            // Dev: trả token để test; production: trả 200 và gửi email
            return Ok(new { resetToken = jwt });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var result = await _authService.ResetPasswordAsync(request);
        if (result != "Success") return BadRequest(new { message = result });
        return Ok(new { message = "Password reset successful" });
    }

    [Authorize]
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
}
