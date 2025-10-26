using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos;

// DTO cho tin nhắn
public class ChatMessageDTO
{
    public long MessageId { get; set; }
    public long ConversationId { get; set; }
    public int SenderId { get; set; }
    public string? SenderName { get; set; }
    public string? SenderAvatar { get; set; }
    public string? SenderRole { get; set; }
    public string? MessageText { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime SentAt { get; set; }
}

// DTO cho conversation
public class ChatConversationDTO
{
    public long ConversationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ChatParticipantDTO> Participants { get; set; } = new();
    public ChatMessageDTO? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}

// DTO cho participant
public class ChatParticipantDTO
{
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? RoleHint { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsOnline { get; set; }
}

// Request để gửi tin nhắn
public class SendMessageRequest
{
    public long? ConversationId { get; set; }
    public int? RecipientId { get; set; }
    public string MessageText { get; set; } = null!;
    public string? AttachmentUrl { get; set; }
}

// Response cho danh sách conversation
public class ConversationListResponse
{
    public long ConversationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public ChatParticipantDTO? OtherParticipant { get; set; }
    public string? LastMessageText { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public string? LastRepliedByStaffName { get; set; }
}

// Response cho lịch sử chat
public class ChatHistoryResponse
{
    public long ConversationId { get; set; }
    public List<ChatMessageDTO> Messages { get; set; } = new();
    public List<ChatParticipantDTO> Participants { get; set; } = new();
}

// DTO cho danh sách owner chat (dành cho staff)
public class OwnerChatItemDTO
{
    public int OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerAvatar { get; set; }
    public long? ConversationId { get; set; }
    public string? LastMessageText { get; set; }
    public DateTime? LastMessageTime { get; set; }
    public int UnreadCount { get; set; }
    public string? LastRepliedByStaffName { get; set; }
    public int? LastRepliedByStaffId { get; set; }
}

