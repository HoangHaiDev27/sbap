using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.DAO;

public class ChatDAO
{
    private readonly VieBookContext _context;

    public ChatDAO(VieBookContext context)
    {
        _context = context;
    }

    // Tìm conversation giữa 2 users
    public async Task<ChatConversation?> GetConversationBetweenUsersAsync(int userId1, int userId2)
    {
        Console.WriteLine($"🔍 Looking for conversation between user {userId1} and user {userId2}");
        
        var conversation = await _context.ChatConversations
            .Include(c => c.ChatParticipants)
            .Where(c => c.ChatParticipants.Count == 2 &&
                       c.ChatParticipants.Any(p => p.UserId == userId1) &&
                       c.ChatParticipants.Any(p => p.UserId == userId2))
            .FirstOrDefaultAsync();
            
        Console.WriteLine($"📋 Found conversation: {conversation?.ConversationId ?? 0}");
        if (conversation != null)
        {
            Console.WriteLine($"👥 Participants: {string.Join(", ", conversation.ChatParticipants.Select(p => $"{p.UserId}({p.RoleHint})"))}");
        }
        
        return conversation;
    }

    // Tạo conversation mới
    public async Task<ChatConversation> CreateConversationAsync(List<int> userIds, Dictionary<int, string>? roleHints = null)
    {
        var conversation = new ChatConversation
        {
            CreatedAt = DateTime.UtcNow
        };

        _context.ChatConversations.Add(conversation);
        await _context.SaveChangesAsync();

        foreach (var userId in userIds)
        {
            var participant = new ChatParticipant
            {
                ConversationId = conversation.ConversationId,
                UserId = userId,
                RoleHint = roleHints?.GetValueOrDefault(userId),
                JoinedAt = DateTime.UtcNow
            };
            _context.ChatParticipants.Add(participant);
        }

        await _context.SaveChangesAsync();
        return conversation;
    }

    // Lấy conversation theo ID
    public async Task<ChatConversation?> GetConversationByIdAsync(long conversationId)
    {
        return await _context.ChatConversations
            .Include(c => c.ChatParticipants)
                .ThenInclude(p => p.User)
                    .ThenInclude(u => u.UserProfile)
            .Include(c => c.ChatMessages.OrderByDescending(m => m.SentAt).Take(1))
            .FirstOrDefaultAsync(c => c.ConversationId == conversationId);
    }

    // Lấy danh sách conversations của user
    public async Task<List<ChatConversation>> GetUserConversationsAsync(int userId)
    {
        return await _context.ChatConversations
            .Include(c => c.ChatParticipants)
                .ThenInclude(p => p.User)
                    .ThenInclude(u => u.UserProfile)
            .Include(c => c.ChatMessages.OrderByDescending(m => m.SentAt).Take(1))
                .ThenInclude(m => m.Sender)
            .Where(c => c.ChatParticipants.Any(p => p.UserId == userId))
            .OrderByDescending(c => c.ChatMessages.OrderByDescending(m => m.SentAt).FirstOrDefault() != null
                ? c.ChatMessages.OrderByDescending(m => m.SentAt).First().SentAt
                : c.CreatedAt)
            .ToListAsync();
    }

    // Gửi tin nhắn
    public async Task<ChatMessage> SendMessageAsync(long conversationId, int senderId, string messageText, string? attachmentUrl = null)
    {
        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderId = senderId,
            MessageText = messageText,
            AttachmentUrl = attachmentUrl,
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        return message;
    }

    // Lấy lịch sử tin nhắn
    public async Task<List<ChatMessage>> GetMessagesAsync(long conversationId, int pageSize = 50, int page = 1)
    {
        return await _context.ChatMessages
            .Include(m => m.Sender)
                .ThenInclude(s => s.UserProfile)
            .Include(m => m.Sender)
                .ThenInclude(s => s.Roles)
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

    // Kiểm tra user có phải participant không
    public async Task<bool> IsUserInConversationAsync(long conversationId, int userId)
    {
        return await _context.ChatParticipants
            .AnyAsync(p => p.ConversationId == conversationId && p.UserId == userId);
    }

    // Lấy tin nhắn theo ID
    public async Task<ChatMessage?> GetMessageByIdAsync(long messageId)
    {
        return await _context.ChatMessages
            .Include(m => m.Sender)
                .ThenInclude(s => s.UserProfile)
            .Include(m => m.Sender)
                .ThenInclude(s => s.Roles)
            .FirstOrDefaultAsync(m => m.MessageId == messageId);
    }

    // Lấy danh sách owners có conversation với staff (cho staff view)
    public async Task<List<(int OwnerId, long? ConversationId, DateTime? LastMessageTime, string? LastMessageText, int? LastStaffId)>> 
        GetOwnerConversationsForStaffAsync()
    {
        // Lấy tất cả owners (users có role "Owner") đã có conversation
        var owners = await _context.Users
            .Where(u => u.Roles.Any(r => r.RoleName.ToLower() == "owner") && u.Status == "Active")
            .Select(u => u.UserId)
            .ToListAsync();

        var result = new List<(int, long?, DateTime?, string?, int?)>();

        foreach (var ownerId in owners)
        {
            // Tìm conversation có owner này (group chat)
            var conversation = await _context.ChatConversations
                .Include(c => c.ChatParticipants)
                .Include(c => c.ChatMessages.OrderByDescending(m => m.SentAt).Take(1))
                    .ThenInclude(m => m.Sender)
                .Where(c => c.ChatParticipants.Any(p => p.UserId == ownerId))
                .OrderByDescending(c => c.ChatMessages.Any() 
                    ? c.ChatMessages.OrderByDescending(m => m.SentAt).First().SentAt 
                    : c.CreatedAt)
                .FirstOrDefaultAsync();

            // Chỉ hiển thị owners đã có conversation và có tin nhắn
            if (conversation != null && conversation.ChatMessages.Any())
            {
                var lastMessage = conversation.ChatMessages.OrderByDescending(m => m.SentAt).First();
                var lastStaffMessage = await _context.ChatMessages
                    .Where(m => m.ConversationId == conversation.ConversationId && 
                               m.Sender.Roles.Any(r => r.RoleName.ToLower() == "staff"))
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefaultAsync();

                result.Add((
                    ownerId,
                    conversation.ConversationId,
                    lastMessage.SentAt,
                    lastMessage.MessageText,
                    lastStaffMessage?.SenderId
                ));
            }
        }

        return result.OrderByDescending(r => r.Item3 ?? DateTime.MinValue).ToList();
    }

    // Lấy tất cả conversations có owner
    public async Task<List<ChatConversation>> GetConversationsWithOwnerAsync(int ownerId)
    {
        return await _context.ChatConversations
            .Include(c => c.ChatParticipants)
                .ThenInclude(p => p.User)
                    .ThenInclude(u => u.Roles)
            .Where(c => c.ChatParticipants.Any(p => p.UserId == ownerId))
            .ToListAsync();
    }

    // Lấy participants của conversation
    public async Task<List<ChatParticipant>> GetParticipantsAsync(long conversationId)
    {
        return await _context.ChatParticipants
            .Include(p => p.User)
                .ThenInclude(u => u.UserProfile)
            .Where(p => p.ConversationId == conversationId)
            .ToListAsync();
    }
}

