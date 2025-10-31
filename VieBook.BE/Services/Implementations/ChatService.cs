using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IUserRepository _userRepository;

    public ChatService(
        IChatRepository chatRepository, 
        IUserRepository userRepository)
    {
        _chatRepository = chatRepository;
        _userRepository = userRepository;
    }

    public async Task<ChatMessageDTO> SendMessageAsync(int senderId, SendMessageRequest request)
    {
        long conversationId;

        if (request.ConversationId.HasValue)
        {
            conversationId = request.ConversationId.Value;
            
            // Kiểm tra user có trong conversation không
            var isInConversation = await _chatRepository.IsUserInConversationAsync(conversationId, senderId);
            if (!isInConversation)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này.");
            }
        }
        else if (request.RecipientId.HasValue)
        {
            // Tạo conversation mới nếu chưa có
            var sender = await _userRepository.GetByIdWithProfileAndRolesAsync(senderId);
            var recipient = await _userRepository.GetByIdWithProfileAndRolesAsync(request.RecipientId.Value);
            
            if (sender == null || recipient == null)
            {
                throw new ArgumentException("Người dùng không tồn tại.");
            }

            var senderRole = sender.Roles.FirstOrDefault()?.RoleName?.ToLower() ?? "customer";
            var recipientRole = recipient.Roles.FirstOrDefault()?.RoleName?.ToLower() ?? "customer";

            conversationId = await GetOrCreateConversationAsync(
                senderId, 
                request.RecipientId.Value,
                senderRole,
                recipientRole
            );
        }
        else
        {
            throw new ArgumentException("Phải cung cấp ConversationId hoặc RecipientId.");
        }

        var message = await _chatRepository.SendMessageAsync(
            conversationId, 
            senderId, 
            request.MessageText, 
            request.AttachmentUrl
        );

        var savedMessage = await _chatRepository.GetMessageByIdAsync(message.MessageId);
        var messageDTO = MapToMessageDTO(savedMessage!);
        
        // Note: WebSocket broadcast sẽ được xử lý ở Controller layer
        return messageDTO;
    }

    public async Task<List<ConversationListResponse>> GetUserConversationsAsync(int userId)
    {
        var conversations = await _chatRepository.GetUserConversationsAsync(userId);
        var result = new List<ConversationListResponse>();

        foreach (var conv in conversations)
        {
            var otherParticipant = conv.ChatParticipants
                .FirstOrDefault(p => p.UserId != userId);

            var lastMessage = conv.ChatMessages
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefault();

            // Tìm staff trả lời cuối cùng
            string? lastStaffName = null;
            var lastStaffMessage = conv.ChatMessages
                .Where(m => m.Sender.Roles.Any(r => r.RoleName.ToLower() == "staff"))
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefault();

            if (lastStaffMessage != null)
            {
                lastStaffName = lastStaffMessage.Sender.UserProfile?.FullName 
                    ?? lastStaffMessage.Sender.Email;
            }

            result.Add(new ConversationListResponse
            {
                ConversationId = conv.ConversationId,
                CreatedAt = conv.CreatedAt,
                OtherParticipant = otherParticipant != null ? MapToParticipantDTO(otherParticipant) : null,
                LastMessageText = lastMessage?.MessageText,
                LastMessageTime = lastMessage?.SentAt,
                UnreadCount = 0, // TODO: Implement unread count
                LastRepliedByStaffName = lastStaffName
            });
        }

        return result;
    }

    public async Task<ChatHistoryResponse> GetChatHistoryAsync(int userId, long conversationId, int page = 1, int pageSize = 50)
    {
        // Kiểm tra quyền truy cập
        var isInConversation = await _chatRepository.IsUserInConversationAsync(conversationId, userId);
        if (!isInConversation)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xem cuộc hội thoại này.");
        }

        var messages = await _chatRepository.GetMessagesAsync(conversationId, pageSize, page);
        var participants = await _chatRepository.GetParticipantsAsync(conversationId);

        return new ChatHistoryResponse
        {
            ConversationId = conversationId,
            Messages = messages.Select(MapToMessageDTO).ToList(),
            Participants = participants.Select(MapToParticipantDTO).ToList()
        };
    }

    public async Task<long> GetOrCreateConversationAsync(int userId1, int userId2, string roleHint1, string roleHint2)
    {
        var conversation = await _chatRepository.GetConversationBetweenUsersAsync(userId1, userId2);
        
        if (conversation != null)
        {
            return conversation.ConversationId;
        }

        var newConversation = await _chatRepository.CreateConversationAsync(
            new List<int> { userId1, userId2 },
            new Dictionary<int, string>
            {
                { userId1, roleHint1 },
                { userId2, roleHint2 }
            }
        );

        return newConversation.ConversationId;
    }

    public async Task<long> GetOrCreateGroupConversationAsync(List<int> userIds, Dictionary<int, string> roleHints)
    {
        // Tìm conversation đã có với owner
        var ownerId = userIds.FirstOrDefault(id => roleHints.GetValueOrDefault(id) == "owner");
        if (ownerId == 0) throw new ArgumentException("Must have at least one owner");
        
        var existingConversations = await _chatRepository.GetConversationsWithOwnerAsync(ownerId);
        
        // Tìm conversation có đúng số lượng participants (owner + tất cả staff)
        var targetConversation = existingConversations.FirstOrDefault(c => 
            c.ChatParticipants.Count == userIds.Count &&
            userIds.All(id => c.ChatParticipants.Any(p => p.UserId == id)));
        
        if (targetConversation != null)
        {
            Console.WriteLine($"Found existing group conversation: {targetConversation.ConversationId}");
            return targetConversation.ConversationId;
        }

        Console.WriteLine($"Creating new group conversation with {userIds.Count} participants");
        var newConversation = await _chatRepository.CreateConversationAsync(userIds, roleHints);
        return newConversation.ConversationId;
    }

    public async Task<List<OwnerChatItemDTO>> GetOwnerListForStaffAsync()
    {
        var ownerConversations = await _chatRepository.GetOwnerConversationsForStaffAsync();
        var result = new List<OwnerChatItemDTO>();

        foreach (var (ownerId, conversationId, lastMessageTime, lastMessageText, lastStaffId) in ownerConversations)
        {
            var owner = await _userRepository.GetByIdWithProfileAndRolesAsync(ownerId);
            if (owner == null) continue;

            string? lastStaffName = null;
            if (lastStaffId.HasValue)
            {
                var staff = await _userRepository.GetByIdWithProfileAndRolesAsync(lastStaffId.Value);
                lastStaffName = staff?.UserProfile?.FullName ?? staff?.Email;
            }

            result.Add(new OwnerChatItemDTO
            {
                OwnerId = ownerId,
                OwnerName = owner.UserProfile?.FullName ?? owner.Email,
                OwnerEmail = owner.Email,
                OwnerAvatar = owner.UserProfile?.AvatarUrl,
                ConversationId = conversationId,
                LastMessageText = lastMessageText,
                LastMessageTime = lastMessageTime,
                UnreadCount = 0, // TODO: Implement unread count
                LastRepliedByStaffName = lastStaffName,
                LastRepliedByStaffId = lastStaffId
            });
        }

        return result;
    }

    public async Task<ChatConversation?> GetConversationBetweenUsersAsync(int userId1, int userId2)
    {
        return await _chatRepository.GetConversationBetweenUsersAsync(userId1, userId2);
    }

    public async Task<List<ChatConversation>> GetConversationsWithOwnerAsync(int ownerId)
    {
        return await _chatRepository.GetConversationsWithOwnerAsync(ownerId);
    }

    public async Task<ChatHistoryResponse> GetChatHistoryForStaffAsync(int staffId, int ownerId, int page = 1, int pageSize = 50)
    {
        Console.WriteLine($"🔍 Staff {staffId} requesting chat with Owner {ownerId}");
        
        // Tìm group conversation có owner và staff này
        var conversations = await _chatRepository.GetConversationsWithOwnerAsync(ownerId);
            
        Console.WriteLine($"📋 Found {conversations.Count} conversations with owner {ownerId}");
        
        // Tìm conversation có owner và staff này (group chat)
        var conversation = conversations.FirstOrDefault(c => 
            c.ChatParticipants.Any(p => p.UserId == ownerId) &&
            c.ChatParticipants.Any(p => p.UserId == staffId) &&
            c.ChatParticipants.Any(p => p.User.Roles.Any(r => r.RoleName.ToLower() == "staff")));
        
        Console.WriteLine($"📋 Found conversation: {conversation?.ConversationId ?? 0}");
        
        if (conversation == null)
        {
            Console.WriteLine("❌ No conversation found, returning empty");
            return new ChatHistoryResponse
            {
                ConversationId = 0,
                Messages = new List<ChatMessageDTO>(),
                Participants = new List<ChatParticipantDTO>()
            };
        }
        
        var messages = await _chatRepository.GetMessagesAsync(conversation.ConversationId, pageSize, page);
        Console.WriteLine($"📨 Found {messages.Count} messages");
        
        var participants = await _chatRepository.GetParticipantsAsync(conversation.ConversationId);

        return new ChatHistoryResponse
        {
            ConversationId = conversation.ConversationId,
            Messages = messages.Select(MapToMessageDTO).ToList(),
            Participants = participants.Select(MapToParticipantDTO).ToList()
        };
    }

    // Helper methods
    private ChatMessageDTO MapToMessageDTO(ChatMessage message)
    {
        return new ChatMessageDTO
        {
            MessageId = message.MessageId,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderName = message.Sender.UserProfile?.FullName ?? message.Sender.Email,
            SenderAvatar = message.Sender.UserProfile?.AvatarUrl,
            SenderRole = message.Sender.Roles.FirstOrDefault()?.RoleName?.ToLower(),
            MessageText = message.MessageText,
            AttachmentUrl = message.AttachmentUrl,
            SentAt = message.SentAt
        };
    }

    private ChatParticipantDTO MapToParticipantDTO(ChatParticipant participant)
    {
        return new ChatParticipantDTO
        {
            UserId = participant.UserId,
            FullName = participant.User.UserProfile?.FullName,
            Email = participant.User.Email,
            AvatarUrl = participant.User.UserProfile?.AvatarUrl,
            RoleHint = participant.RoleHint,
            JoinedAt = participant.JoinedAt,
            IsOnline = false // TODO: Implement online status
        };
    }
}

