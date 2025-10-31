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
            var currentUser = await _userRepository.GetByIdWithProfileAndRolesAsync(userId);
            var isOwner = currentUser?.Roles.Any(r => r.RoleName.ToLower() == "owner") ?? false;
            
            // Nếu owner gửi tin nhắn lần đầu (không có conversationId), tạo group conversation với tất cả staff
            bool isNewConversation = false;
            if (!request.ConversationId.HasValue && isOwner)
            {
                Console.WriteLine($"🆕 Owner {userId} sending first message, checking for existing group conversation");
                
                // Kiểm tra xem đã có group conversation với owner này chưa
                var existingConversations = await _chatService.GetConversationsWithOwnerAsync(userId);
                var hasGroupConversation = existingConversations.Any(c => 
                    c.ChatParticipants.Any(p => p.UserId == userId) &&
                    c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")) &&
                    c.ChatParticipants.Count > 2); // Group conversation có nhiều hơn 2 người
                
                if (!hasGroupConversation)
                {
                    // Tạo group conversation với tất cả staff
                    var staffUsers = await _userRepository.GetUsersByRoleAsync("Staff");
                    if (staffUsers != null && staffUsers.Any())
                    {
                        var allUserIds = new List<int> { userId };
                        allUserIds.AddRange(staffUsers.Select(s => s.UserId));
                        
                        var roleHints = new Dictionary<int, string>();
                        roleHints[userId] = "owner";
                        foreach (var staff in staffUsers)
                        {
                            roleHints[staff.UserId] = "staff";
                        }
                        
                        var groupConversationId = await _chatService.GetOrCreateGroupConversationAsync(allUserIds, roleHints);
                        request.ConversationId = groupConversationId;
                        isNewConversation = true;
                        Console.WriteLine($"✅ Created new group conversation {groupConversationId} with {allUserIds.Count} participants");
                    }
                    else
                    {
                        // Nếu không có staff, tạo conversation 1-1 với chính mình (fallback)
                        var testConversationId = await _chatService.GetOrCreateConversationAsync(userId, userId, "owner", "staff");
                        request.ConversationId = testConversationId;
                        isNewConversation = true;
                        Console.WriteLine($"⚠️ No staff found, created test conversation {testConversationId}");
                    }
                }
                else
                {
                    // Đã có group conversation, lấy conversationId
                    var groupConversation = existingConversations.FirstOrDefault(c => 
                        c.ChatParticipants.Any(p => p.UserId == userId) &&
                        c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")) &&
                        c.ChatParticipants.Count > 2);
                    
                    if (groupConversation != null)
                    {
                        request.ConversationId = groupConversation.ConversationId;
                        Console.WriteLine($"✅ Using existing group conversation {groupConversation.ConversationId}");
                    }
                }
            }
            else if (!request.ConversationId.HasValue && request.RecipientId.HasValue && isOwner)
            {
                // Fallback: nếu có RecipientId, kiểm tra conversation 1-1 (không nên dùng trong production)
                var existingConversation = await _chatService.GetConversationBetweenUsersAsync(userId, request.RecipientId.Value);
                isNewConversation = existingConversation == null;
            }
            
            var message = await _chatService.SendMessageAsync(userId, request);
            
            // Nếu là conversation mới từ owner, thông báo đến tất cả staff
            if (isNewConversation && isOwner)
            {
                try
                {
                    var staffUsers = await _userRepository.GetUsersByRoleAsync("Staff");
                    if (staffUsers != null && staffUsers.Any())
                    {
                        var staffUserIds = staffUsers.Select(s => s.UserId).ToList();
                        var notificationData = new
                        {
                            conversationId = message.ConversationId,
                            ownerId = userId,
                            ownerName = currentUser?.UserProfile?.FullName ?? currentUser?.Email,
                            ownerEmail = currentUser?.Email,
                            ownerAvatar = currentUser?.UserProfile?.AvatarUrl,
                            message = "New conversation created"
                        };
                        
                        await ChatHub.SendNotificationToStaffUsers(_hubContext, staffUserIds, "NewConversation", notificationData);
                        // Fallback: broadcast to all in case staff connections aren't mapped yet
                        await ChatHub.BroadcastToAll(_hubContext, "NewConversation", notificationData);
                        Console.WriteLine($"✅ Broadcasted NewConversation to {staffUserIds.Count} staff members");
                    }
                }
                catch (Exception notifyEx)
                {
                    Console.WriteLine($"⚠️ Failed to broadcast NewConversation: {notifyEx.Message}");
                }
            }
            
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
            
            // Kiểm tra xem đã có group conversation chưa
            var existingConversations = await _chatService.GetConversationsWithOwnerAsync(userId);
            var hasGroupConversation = existingConversations.Any(c => 
                c.ChatParticipants.Any(p => p.UserId == userId) &&
                c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")) &&
                c.ChatParticipants.Count > 2);
            
            long conversationId;
            bool isNewConversation = false;
            
            if (hasGroupConversation)
            {
                // Đã có group conversation, lấy conversationId
                var groupConversation = existingConversations.FirstOrDefault(c => 
                    c.ChatParticipants.Any(p => p.UserId == userId) &&
                    c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")) &&
                    c.ChatParticipants.Count > 2);
                conversationId = groupConversation?.ConversationId ?? await _chatService.GetOrCreateGroupConversationAsync(allUserIds, roleHints);
                Console.WriteLine($"✅ Using existing group conversation {conversationId}");
            }
            else
            {
                // Tạo group conversation mới
                conversationId = await _chatService.GetOrCreateGroupConversationAsync(allUserIds, roleHints);
                isNewConversation = true;
                Console.WriteLine($"✅ Created new group conversation {conversationId}");
            }

            // Broadcast notification đến tất cả staff về conversation mới (chỉ khi là conversation mới)
            if (isNewConversation)
            {
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
                    // Fallback: broadcast to all clients to ensure immediate visibility
                    await ChatHub.BroadcastToAll(_hubContext, "NewConversation", notificationData);
                    Console.WriteLine($"✅ Broadcasted NewConversation to {staffUserIds.Count} staff members");
                }
                catch (Exception wsEx)
                {
                    Console.WriteLine($"⚠️ Failed to broadcast NewConversation: {wsEx.Message}");
                    // Không throw lỗi để không ảnh hưởng đến flow chính
                }
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

