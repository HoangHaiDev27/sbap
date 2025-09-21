using BusinessObject.Dtos;
using BusinessObject.Models;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Net.payOS;
using Net.payOS.Types;
using Services.Interfaces;
using VieBook.BE.Configuration;
using VieBook.BE.Helpers;

namespace VieBook.BE.Controllers.WalletTransaction
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhookController : ControllerBase
    {
        private readonly PayOS _payOS;
        private readonly IWalletTransactionService _walletTransactionService;

        public WebhookController(PayOS payOS, IWalletTransactionService walletTransactionService)
        {
            _payOS = payOS;
            _walletTransactionService = walletTransactionService;
        }

        [HttpPost("payos-webhook")]
        public async Task<IActionResult> PayOSWebhook([FromBody] WebhookType webhookData)
        {
            try
            {
                // Verify webhook data từ PayOS
                var webhookDataVerified = _payOS.verifyPaymentWebhookData(webhookData);

                // Chuyển đổi sang DTO
                var webhookDTO = new PayOSWebhookDTO
                {
                    OrderCode = (int)webhookDataVerified.orderCode,
                    AmountMoney = webhookDataVerified.amount,
                    AmountCoin = (decimal)webhookDataVerified.amount / 1000, // 1 VNĐ = 1 xu
                    Description = webhookDataVerified.description,
                    Status = "success", // Mặc định là success nếu webhook được gọi
                    TransactionId = webhookDataVerified.orderCode.ToString(), // Sử dụng orderCode làm transactionId
                    PaymentMethod = "PayOS",
                    UserId = ExtractUserIdFromDescription(webhookDataVerified.description)
                };

                // Xử lý thanh toán và lưu vào database
                var walletTransaction = await _walletTransactionService.ProcessPaymentAsync(webhookDTO);

                return Ok(new Response(0, "Webhook processed successfully", new
                {
                    transactionId = walletTransaction.WalletTransactionId,
                    status = walletTransaction.Status
                }));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Webhook error: {ex.Message}");
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        [HttpGet("transactions/{userId}")]
        public async Task<IActionResult> GetUserTransactions(int userId)
        {
            try
            {
                var transactions = await _walletTransactionService.GetUserTransactionsAsync(userId);
                return Ok(new Response(0, "Success", transactions));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        [HttpGet("test-redirect")]
        public IActionResult TestRedirect()
        {
            return Ok(new Response(0, "Test redirect endpoint working", new
            {
                message = "This endpoint is working",
                timestamp = DateTime.UtcNow
            }));
        }

        [HttpGet("payment-success")]
        public IActionResult PaymentSuccess([FromQuery] int? orderCode, [FromQuery] int? amount)
        {
            // Redirect về frontend với parameters
            var frontendUrl = ApiConfiguration.FrontendUrls.RechargePage("success", amount, orderCode);
            return Redirect(frontendUrl);
        }

        [HttpGet("payment-cancel")]
        public IActionResult PaymentCancel([FromQuery] int? orderCode, [FromQuery] int? amount)
        {
            // Redirect về frontend với parameters
            var frontendUrl = ApiConfiguration.FrontendUrls.RechargePage("cancel", amount, orderCode);
            return Redirect(frontendUrl);
        }

        [HttpGet("handle-payos-redirect")]
        public IActionResult HandlePayOSRedirect([FromQuery] string? status, [FromQuery] int? amount, [FromQuery] int? orderCode)
        {
            // Handle PayOS redirect với bất kỳ parameters nào
            var frontendUrl = ApiConfiguration.FrontendUrls.RechargePage(status ?? "", amount, orderCode);
            return Redirect(frontendUrl);
        }

        [HttpGet("verify-payment/{orderCode}")]
        public async Task<IActionResult> VerifyPayment(int orderCode)
        {
            try
            {
                // Lấy userId từ JWT token
                var userId = UserHelper.GetCurrentUserId(HttpContext);
                if (!userId.HasValue)
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                // Lấy thông tin payment từ PayOS
                var paymentInfo = await _payOS.getPaymentLinkInformation(orderCode);

                // Kiểm tra trạng thái
                if (paymentInfo.status == "PAID")
                {
                    // Tạo webhook data giả lập
                    var webhookDTO = new PayOSWebhookDTO
                    {
                        OrderCode = orderCode,
                        AmountMoney = paymentInfo.amount,
                        AmountCoin = (decimal)paymentInfo.amount / 1000,
                        Description = "Nap xu U1 " + paymentInfo.amount, // Tạo description mới
                        Status = MapPayOSStatusToDatabaseStatus("PAID"), // Map PayOS status sang database status
                        TransactionId = orderCode.ToString(), // Sử dụng orderCode làm transactionId
                        PaymentMethod = "PayOS",
                        UserId = userId.Value // Sử dụng userId từ JWT token
                    };

                    // Xử lý thanh toán
                    var walletTransaction = await _walletTransactionService.ProcessPaymentAsync(webhookDTO);

                    return Ok(new Response(0, "Payment verified successfully", new
                    {
                        status = "success",
                        transactionId = walletTransaction.WalletTransactionId,
                        amount = paymentInfo.amount
                    }));
                }
                else
                {
                    var mappedStatus = MapPayOSStatusToDatabaseStatus(paymentInfo.status);
                    return Ok(new Response(0, "Payment not completed", new
                    {
                        status = mappedStatus.ToLower(),
                        amount = paymentInfo.amount
                    }));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        private int? ExtractUserIdFromDescription(string description)
        {
            // Extract user ID từ description: "Nap xu U1 50000"
            var match = System.Text.RegularExpressions.Regex.Match(description, @"U(\d+)");
            if (match.Success && int.TryParse(match.Groups[1].Value, out int userId))
            {
                return userId;
            }
            return 1; // Default user ID nếu không extract được
        }

        private string MapPayOSStatusToDatabaseStatus(string payOSStatus)
        {
            return payOSStatus?.ToUpper() switch
            {
                "PAID" => "Succeeded",
                "SUCCESS" => "Succeeded",
                "COMPLETED" => "Succeeded",
                "CONFIRMED" => "Succeeded",
                "PENDING" => "Pending",
                "FAILED" => "Failed",
                "CANCELLED" => "Cancelled",
                "CANCEL" => "Cancelled",
                _ => "Pending" // Default fallback
            };
        }
    }
}
