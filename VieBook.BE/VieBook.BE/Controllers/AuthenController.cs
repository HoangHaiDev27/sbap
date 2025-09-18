using BusinessObject.Dtos;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

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
}
