using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers
{
    public class RejectPaymentRequestDTO
    {
        public string? Reason { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentRequestController : ControllerBase
    {
        private readonly IPaymentRequestService _paymentRequestService;

        public PaymentRequestController(IPaymentRequestService paymentRequestService)
        {
            _paymentRequestService = paymentRequestService;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePaymentRequest([FromBody] CreatePaymentRequestDTO createDto)
        {
            try
            {
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var paymentRequest = await _paymentRequestService.CreatePaymentRequestAsync(userId.Value, createDto);
                return Ok(new { message = "Yêu cầu rút tiền đã được gửi thành công", data = paymentRequest });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserPaymentRequests()
        {
            try
            {
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var paymentRequests = await _paymentRequestService.GetPaymentRequestsByUserIdAsync(userId.Value);
                return Ok(paymentRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{paymentRequestId}")]
        public async Task<IActionResult> GetPaymentRequestById(long paymentRequestId)
        {
            try
            {
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var paymentRequest = await _paymentRequestService.GetPaymentRequestByIdAsync(paymentRequestId);
                if (paymentRequest == null)
                {
                    return NotFound(new { message = "Payment request not found" });
                }

                // Kiểm tra xem payment request có thuộc về user hiện tại không
                if (paymentRequest.UserId != userId.Value)
                {
                    return Forbid();
                }

                return Ok(paymentRequest);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetAllPaymentRequests()
        {
            try
            {
                var paymentRequests = await _paymentRequestService.GetAllPaymentRequestsAsync();
                return Ok(paymentRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{paymentRequestId}/approve")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> ApprovePaymentRequest(long paymentRequestId)
        {
            try
            {
                var staffId = UserHelper.GetCurrentUserId(HttpContext);
                if (!staffId.HasValue)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var result = await _paymentRequestService.ApprovePaymentRequestAsync(paymentRequestId, staffId.Value);
                
                if (!result)
                {
                    return BadRequest(new { message = "Không thể duyệt yêu cầu. Yêu cầu có thể không tồn tại hoặc đã được xử lý." });
                }

                return Ok(new { message = "Yêu cầu rút tiền đã được duyệt thành công" });
            }
            catch (Exception ex)
            {
                // Nếu là lỗi validation (thông tin ngân hàng không hợp lệ), trả về BadRequest
                if (ex.Message.Contains("tài khoản") || ex.Message.Contains("ngân hàng") || ex.Message.Contains("không hợp lệ") || ex.Message.Contains("chưa cập nhật"))
                {
                    return BadRequest(new { message = ex.Message });
                }
                
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{paymentRequestId}/reject")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> RejectPaymentRequest(long paymentRequestId, [FromBody] RejectPaymentRequestDTO? dto = null)
        {
            try
            {
                var staffId = UserHelper.GetCurrentUserId(HttpContext);
                if (!staffId.HasValue)
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                var reason = dto?.Reason;
                var result = await _paymentRequestService.RejectPaymentRequestAsync(paymentRequestId, staffId.Value, reason);
                
                if (!result)
                {
                    return BadRequest(new { message = "Không thể từ chối yêu cầu. Yêu cầu có thể không tồn tại hoặc đã được xử lý." });
                }

                return Ok(new { message = "Yêu cầu rút tiền đã bị từ chối" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}

