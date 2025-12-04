using BusinessObject.Chatbase;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Service.Interfaces;
using System.Security.Claims;
using VieBook.BE.Configuration;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbaseController : ControllerBase
    {
        private readonly IChatbaseService _chatbaseService;

        public ChatbaseController(IChatbaseService chatbaseService)
        {
            _chatbaseService = chatbaseService;
        }

        // Gửi tin nhắn đến Chatbase
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatbaseRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Question))
                return BadRequest(new { message = "Câu hỏi không được để trống." });

            int? userId = request.UserId;

            // Nếu có token => ưu tiên userId trong token
            if (User?.Identity?.IsAuthenticated == true)
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                            ?? User.FindFirst("UserId")
                            ?? User.FindFirst("sub");

                if (claim != null && int.TryParse(claim.Value, out var id))
                    userId = id;
            }
            var frontendUrl = ApiConfiguration.FRONTEND_URL;
            // Gọi Chatbase service
            var response = await _chatbaseService.GetChatResponseAsync(request.Question, frontendUrl, userId);

            return Ok(new
            {
                userId = userId ?? 0,
                response
            });
        }

        [HttpGet("chat-history")]
        public async Task<IActionResult> GetChatHistory()
        {
            int? userId = null;

            if (User?.Identity?.IsAuthenticated == true)
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                            ?? User.FindFirst("UserId")
                            ?? User.FindFirst("sub");

                if (claim != null && int.TryParse(claim.Value, out var id))
                    userId = id;
            }

            var history = await _chatbaseService.GetChatHistoryAsync(userId);

            return Ok(new
            {
                userId = userId ?? 0,
                history = history.Select(h => new
                {
                    sender = h.Sender,
                    text = h.Message,
                    createdAt = h.CreatedAt
                })
            });
        }
    }
}
