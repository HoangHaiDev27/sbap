using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Services.Interfaces;
using Repositories.Interfaces;
using System.Security.Claims;
using VieBook.BE.Hubs;

namespace VieBook.BE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly IUserRepository _userRepository;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(
        IChatService chatService, 
        IUserRepository userRepository,
        IHubContext<ChatHub> hubContext)
    {
        _chatService = chatService;
        _userRepository = userRepository;
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

    // Lấy danh sách conversations của user
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        try
        {
            var userId = GetCurrentUserId();
            var conversations = await _chatService.GetUserConversationsAsync(userId);
            return Ok(conversations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Lấy lịch sử chat của một conversation
    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<IActionResult> GetChatHistory(long conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            var history = await _chatService.GetChatHistoryAsync(userId, conversationId, page, pageSize);
            return Ok(history);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Gửi tin nhắn
    [HttpPost("messages")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var message = await _chatService.SendMessageAsync(userId, request);
            
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

    // Tạo hoặc lấy conversation với staff
    [HttpPost("start-support-chat")]
    public async Task<IActionResult> StartSupportChat()
    {
        try
        {
            var userId = GetCurrentUserId();
            Console.WriteLine($"User {userId} starting support chat");
            
            // Tìm tất cả staff có role "staff"
            var staffUsers = await _userRepository.GetUsersByRoleAsync("Staff");
            if (staffUsers == null || !staffUsers.Any())
            {
                // Nếu không có staff, tạm thời cho chat với chính mình (để test)
                Console.WriteLine("Warning: No staff found, creating self-conversation for testing");
                var testConversationId = await _chatService.GetOrCreateConversationAsync(
                    userId, 
                    userId,
                    "owner",
                    "staff"
                );
                return Ok(new { conversationId = testConversationId, warning = "No staff available, test mode" });
            }
            
            // Tạo group conversation với Owner + tất cả Staff
            var allUserIds = new List<int> { userId };
            allUserIds.AddRange(staffUsers.Select(s => s.UserId));
            
            var roleHints = new Dictionary<int, string>();
            roleHints[userId] = "owner";
            foreach (var staff in staffUsers)
            {
                roleHints[staff.UserId] = "staff";
            }
            
            Console.WriteLine($"Creating group chat with Owner {userId} and {staffUsers.Count} staff members");
            
            var conversationId = await _chatService.GetOrCreateGroupConversationAsync(allUserIds, roleHints);

            // Broadcast notification đến tất cả staff về conversation mới
            try
            {
                var staffUserIds = staffUsers.Select(s => s.UserId).ToList();
                var currentUser = await _userRepository.GetByIdWithProfileAndRolesAsync(userId);
                var notificationData = new
                {
                    conversationId,
                    ownerId = userId,
                    ownerName = currentUser?.UserProfile?.FullName ?? currentUser?.Email,
                    ownerEmail = currentUser?.Email,
                    ownerAvatar = currentUser?.UserProfile?.AvatarUrl,
                    message = "New conversation created"
                };
                
                await ChatHub.SendNotificationToStaffUsers(_hubContext, staffUserIds, "NewConversation", notificationData);
                Console.WriteLine($"✅ Broadcasted NewConversation to {staffUserIds.Count} staff members");
            }
            catch (Exception wsEx)
            {
                Console.WriteLine($"⚠️ Failed to broadcast NewConversation: {wsEx.Message}");
                // Không throw lỗi để không ảnh hưởng đến flow chính
            }

            return Ok(new { conversationId });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in StartSupportChat: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { message = ex.Message, detail = ex.InnerException?.Message ?? ex.Message });
        }
    }
}

