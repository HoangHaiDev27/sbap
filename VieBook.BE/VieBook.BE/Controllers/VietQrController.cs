using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VietQrController : ControllerBase
    {
        private readonly IVietQrService _vietQrService;

        public VietQrController(IVietQrService vietQrService)
        {
            _vietQrService = vietQrService;
        }

        [HttpGet("banks")]
        public async Task<IActionResult> GetSupportedBanks()
        {
            try
            {
                var banks = await _vietQrService.GetSupportedBanksAsync();
                return Ok(banks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("generate")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GenerateQRCode([FromBody] VietQrRequestDTO request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.AccountNo) ||
                    string.IsNullOrWhiteSpace(request.AccountNo))
                {
                    return BadRequest(new { message = "Số tài khoản hiện tại không đúng" });
                }

                if (string.IsNullOrEmpty(request.AccountName) ||
                    string.IsNullOrEmpty(request.AcqId) ||
                    request.Amount <= 0)
                {
                    return BadRequest(new { message = "Thông tin không hợp lệ" });
                }

                var result = await _vietQrService.GenerateQRCodeAsync(request);

                if (!result.Success)
                {
                    // Kiểm tra nếu message có chứa thông tin về tài khoản
                    var errorMessage = result.Message ?? "";
                    if (errorMessage.Contains("tài khoản") ||
                        errorMessage.Contains("account") ||
                        errorMessage.Contains("không hợp lệ"))
                    {
                        return BadRequest(new { message = "Số tài khoản hiện tại không đúng" });
                    }

                    return BadRequest(new { message = result.Message });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}

