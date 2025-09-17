using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Mvc;
using Net.payOS;
using Net.payOS.Types;

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
                int orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));
                ItemData item = new ItemData("Nạp xu", 1, request.Amount);
                List<ItemData> items = new List<ItemData> { item };

                // Get the current request's base URL
                var httpRequest = _httpContextAccessor.HttpContext?.Request;
                var baseUrl = httpRequest != null ? $"{httpRequest.Scheme}://{httpRequest.Host}" : "http://localhost:5143";

                // Tạo description ngắn gọn (tối đa 25 ký tự)
                var description = $"Nap xu U1 {request.Amount}";

                PaymentData paymentData = new PaymentData(
                    orderCode,
                    request.Amount,
                    description,
                    items,
                    "http://localhost:3008/recharge?status=cancel&amount=" + request.Amount + "&orderCode=" + orderCode,
                    "http://localhost:3008/recharge?status=success&amount=" + request.Amount + "&orderCode=" + orderCode
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