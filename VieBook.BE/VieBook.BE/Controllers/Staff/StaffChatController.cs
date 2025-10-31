using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Services.Interfaces;
using System.Security.Claims;
using VieBook.BE.Hubs;

namespace VieBook.BE.Controllers.Staff;

[ApiController]
[Route("api/staff/[controller]")]
[Authorize(Roles = "Staff")]
public class StaffChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly IHubContext<ChatHub> _hubContext;

    public StaffChatController(IChatService chatService, IHubContext<ChatHub> hubContext)
    {
        _chatService = chatService;
        _hubContext = hubContext;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID không hợp lệ");
        }
        return userId;
    }

    // Lấy danh sách owners có thể chat
    [HttpGet("owners")]
    public async Task<IActionResult> GetOwnerList()
    {
        try
        {
            var owners = await _chatService.GetOwnerListForStaffAsync();
            return Ok(owners);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Lấy lịch sử chat với owner
    [HttpGet("owners/{ownerId}/messages")]
    public async Task<IActionResult> GetChatWithOwner(int ownerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var staffId = GetCurrentUserId();
            var history = await _chatService.GetChatHistoryForStaffAsync(staffId, ownerId, page, pageSize);
            return Ok(history);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Gửi tin nhắn cho owner
    [HttpPost("messages")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var staffId = GetCurrentUserId();
            
            // Nếu không có conversationId, tìm conversation với owner
            if (!request.ConversationId.HasValue && request.RecipientId.HasValue)
            {
                // Tìm group conversation có owner và staff này
                var conversations = await _chatService.GetConversationsWithOwnerAsync(request.RecipientId.Value);
                    
                var conversation = conversations.FirstOrDefault(c => 
                    c.ChatParticipants.Any(p => p.UserId == request.RecipientId.Value) &&
                    c.ChatParticipants.Any(p => p.UserId == staffId) &&
                    c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")));
                    
                if (conversation != null)
                {
                    request.ConversationId = conversation.ConversationId;
                }
            }
            
            var message = await _chatService.SendMessageAsync(staffId, request);
            
            // Broadcast tin nhắn qua WebSocket
            try
            {
                await ChatHub.SendMessageToConversation(_hubContext, message.ConversationId, message);
                Console.WriteLine($"✅ Broadcasted message to conversation {message.ConversationId}");
            }
            catch (Exception wsEx)
            {
                Console.WriteLine($"⚠️ Failed to broadcast via WebSocket: {wsEx.Message}");
                // Không throw lỗi để không ảnh hưởng đến flow chính
            }
            
            return Ok(message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

