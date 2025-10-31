using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace VieBook.BE.Hubs;

public class ChatHub : Hub
{
    // Lưu mapping userId -> connectionId
    private static readonly ConcurrentDictionary<int, HashSet<string>> _userConnections = new();
    
    // Lưu mapping conversationId -> danh sách userId
    private static readonly ConcurrentDictionary<long, HashSet<int>> _conversationParticipants = new();

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userIdClaim = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)
                          ?? httpContext?.User?.FindFirst("UserId")
                          ?? httpContext?.User?.FindFirst("sub");

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            // Lưu connection cho user
            _userConnections.AddOrUpdate(
                userId,
                new HashSet<string> { Context.ConnectionId },
                (key, existingSet) =>
                {
                    existingSet.Add(Context.ConnectionId);
                    return existingSet;
                }
            );

            Console.WriteLine($"✅ User {userId} connected with ConnectionId: {Context.ConnectionId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var httpContext = Context.GetHttpContext();
        var userIdClaim = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)
                          ?? httpContext?.User?.FindFirst("UserId")
                          ?? httpContext?.User?.FindFirst("sub");

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                connections.Remove(Context.ConnectionId);
                if (connections.Count == 0)
                {
                    _userConnections.TryRemove(userId, out _);
                }
            }

            Console.WriteLine($"❌ User {userId} disconnected: {Context.ConnectionId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join vào một conversation để nhận tin nhắn realtime
    /// </summary>
    public async Task JoinConversation(long conversationId, List<int> participantIds)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        
        // Lưu thông tin participants
        _conversationParticipants.AddOrUpdate(
            conversationId,
            new HashSet<int>(participantIds),
            (key, existingSet) =>
            {
                foreach (var id in participantIds)
                {
                    existingSet.Add(id);
                }
                return existingSet;
            }
        );

        Console.WriteLine($"📥 User joined conversation {conversationId}");
    }

    /// <summary>
    /// Leave conversation
    /// </summary>
    public async Task LeaveConversation(long conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
        Console.WriteLine($"📤 User left conversation {conversationId}");
    }

    /// <summary>
    /// Gửi tin nhắn đến tất cả users trong conversation
    /// </summary>
    public static async Task SendMessageToConversation(IHubContext<ChatHub> hubContext, long conversationId, object messageData)
    {
        await hubContext.Clients.Group($"conversation_{conversationId}").SendAsync("ReceiveMessage", messageData);
        Console.WriteLine($"📨 Message sent to conversation {conversationId}");
    }

    /// <summary>
    /// Gửi tin nhắn đến một user cụ thể (dù họ có đang ở conversation nào)
    /// </summary>
    public static async Task SendMessageToUser(IHubContext<ChatHub> hubContext, int userId, object messageData)
    {
        if (_userConnections.TryGetValue(userId, out var connections))
        {
            foreach (var connectionId in connections)
            {
                await hubContext.Clients.Client(connectionId).SendAsync("ReceiveMessage", messageData);
            }
            Console.WriteLine($"📨 Message sent to user {userId}");
        }
    }

    /// <summary>
    /// Typing indicator
    /// </summary>
    public async Task UserTyping(long conversationId, string userName)
    {
        await Clients.OthersInGroup($"conversation_{conversationId}")
            .SendAsync("UserTyping", new { conversationId, userName });
    }

    /// <summary>
    /// Stop typing
    /// </summary>
    public async Task UserStoppedTyping(long conversationId, string userName)
    {
        await Clients.OthersInGroup($"conversation_{conversationId}")
            .SendAsync("UserStoppedTyping", new { conversationId, userName });
    }

    /// <summary>
    /// Gửi notification đến tất cả staff users (dựa trên userId)
    /// </summary>
    public static async Task SendNotificationToStaffUsers(IHubContext<ChatHub> hubContext, List<int> staffUserIds, string eventName, object data)
    {
        foreach (var staffId in staffUserIds)
        {
            if (_userConnections.TryGetValue(staffId, out var connections))
            {
                foreach (var connectionId in connections)
                {
                    await hubContext.Clients.Client(connectionId).SendAsync(eventName, data);
                }
                Console.WriteLine($"📢 Sent {eventName} notification to staff user {staffId}");
            }
        }
    }

    /// <summary>
    /// Broadcast an event to all connected clients (fallback when per-user mapping isn't ready yet)
    /// </summary>
    public static async Task BroadcastToAll(IHubContext<ChatHub> hubContext, string eventName, object data)
    {
        await hubContext.Clients.All.SendAsync(eventName, data);
        Console.WriteLine($"📢 Broadcast {eventName} to all connected clients");
    }
}

