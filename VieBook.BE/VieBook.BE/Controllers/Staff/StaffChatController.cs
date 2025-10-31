using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Services.Interfaces;
using Repositories.Interfaces;
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
    private readonly IUserRepository _userRepository;

    public StaffChatController(IChatService chatService, IHubContext<ChatHub> hubContext, IUserRepository userRepository)
    {
        _chatService = chatService;
        _hubContext = hubContext;
        _userRepository = userRepository;
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

    // Tìm kiếm owners theo tên/email (dù đã có hoặc chưa có conversation)
    [HttpGet("owners/search")]
    public async Task<IActionResult> SearchOwners([FromQuery] string q)
    {
        try
        {
            q = q?.Trim() ?? string.Empty;
            var owners = await _userRepository.GetUsersByRoleAsync("Owner");
            var matched = owners
                .Where(u => string.IsNullOrEmpty(q)
                    || (u.UserProfile?.FullName?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false)
                    || (u.Email?.Contains(q, StringComparison.OrdinalIgnoreCase) ?? false))
                .Take(20)
                .ToList();

            var results = new List<OwnerChatItemDTO>();
            foreach (var owner in matched)
            {
                long? conversationId = null;
                try
                {
                    var conversations = await _chatService.GetConversationsWithOwnerAsync(owner.UserId);
                    var conversation = conversations
                        .Where(c => c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")))
                        .OrderByDescending(c => c.ChatMessages.Any() ? c.ChatMessages.Max(m => m.SentAt) : c.CreatedAt)
                        .FirstOrDefault();
                    conversationId = conversation?.ConversationId;
                }
                catch {}

                results.Add(new OwnerChatItemDTO
                {
                    OwnerId = owner.UserId,
                    OwnerName = owner.UserProfile?.FullName ?? owner.Email,
                    OwnerEmail = owner.Email,
                    OwnerAvatar = owner.UserProfile?.AvatarUrl,
                    ConversationId = conversationId,
                    LastMessageText = null,
                    LastMessageTime = null,
                    UnreadCount = 0,
                    LastRepliedByStaffName = null,
                    LastRepliedByStaffId = null
                });
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    // Staff khởi tạo hoặc lấy conversation với một owner cụ thể
    [HttpPost("owners/{ownerId}/start")]
    public async Task<IActionResult> StartConversationWithOwner(int ownerId)
    {
        try
        {
            var staffUsers = await _userRepository.GetUsersByRoleAsync("Staff");
            if (staffUsers == null || !staffUsers.Any())
            {
                return StatusCode(500, new { message = "No staff available" });
            }

            var allUserIds = new List<int> { ownerId };
            allUserIds.AddRange(staffUsers.Select(s => s.UserId));

            var roleHints = new Dictionary<int, string>();
            roleHints[ownerId] = "owner";
            foreach (var s in staffUsers) roleHints[s.UserId] = "staff";

            var conversationId = await _chatService.GetOrCreateGroupConversationAsync(allUserIds, roleHints);

            // Thông báo NewConversation tới tất cả staff (để sidebar cập nhật)
            var notificationData = new
            {
                conversationId,
                ownerId,
                message = "New conversation created by staff"
            };
            await ChatHub.SendNotificationToStaffUsers(_hubContext, staffUsers.Select(s => s.UserId).ToList(), "NewConversation", notificationData);
            await ChatHub.BroadcastToAll(_hubContext, "NewConversation", notificationData);

            return Ok(new { conversationId });
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

