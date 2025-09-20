using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Net.payOS;
using Net.payOS.Types;
using VieBook.BE.Configuration;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers.WalletTransaction
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckoutController : ControllerBase
    {
        private readonly PayOS _payOS;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public CheckoutController(PayOS payOS, IHttpContextAccessor httpContextAccessor)
        {
            _payOS = payOS;
            _httpContextAccessor = httpContextAccessor;
        }
        [HttpPost("/create-payment-link")]
        public async Task<IActionResult> CreatePaymentLink([FromBody] PaymentRequestDTO request)
        {
            try
            {
                // Lấy userId từ JWT token
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                int orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));
                ItemData item = new ItemData("Nạp xu", 1, request.Amount);
                List<ItemData> items = new List<ItemData> { item };

                // Get the current request's base URL
                var httpRequest = _httpContextAccessor.HttpContext?.Request;
                var baseUrl = httpRequest != null ? $"{httpRequest.Scheme}://{httpRequest.Host}" : "http://localhost:5143";

                // Tạo description ngắn gọn (tối đa 25 ký tự)
                var description = $"Nap xu U1 {request.Amount}";

                // Sử dụng ApiConfiguration để tạo URLs
                var cancelUrl = ApiConfiguration.FrontendUrls.RechargePage("cancel", request.Amount, orderCode);
                var successUrl = ApiConfiguration.FrontendUrls.RechargePage("success", request.Amount, orderCode);

                PaymentData paymentData = new PaymentData(
                    orderCode,
                    request.Amount,
                    description,
                    items,
                    cancelUrl,
                    successUrl
                );
                CreatePaymentResult createPayment = await _payOS.createPaymentLink(paymentData);
                return Ok(new Response(0, "success", createPayment));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }
    }
}