using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;

namespace Repositories.Interfaces;

public interface IChatRepository
{
    Task<ChatConversation?> GetConversationBetweenUsersAsync(int userId1, int userId2);
    Task<ChatConversation> CreateConversationAsync(List<int> userIds, Dictionary<int, string>? roleHints = null);
    Task<ChatConversation?> GetConversationByIdAsync(long conversationId);
    Task<List<ChatConversation>> GetUserConversationsAsync(int userId);
    Task<List<ChatConversation>> GetConversationsWithOwnerAsync(int ownerId);
    Task<ChatMessage> SendMessageAsync(long conversationId, int senderId, string messageText, string? attachmentUrl = null);
    Task<List<ChatMessage>> GetMessagesAsync(long conversationId, int pageSize = 50, int page = 1);
    Task<bool> IsUserInConversationAsync(long conversationId, int userId);
    Task<ChatMessage?> GetMessageByIdAsync(long messageId);
    Task<List<(int OwnerId, long? ConversationId, DateTime? LastMessageTime, string? LastMessageText, int? LastStaffId)>> 
        GetOwnerConversationsForStaffAsync();
    Task<List<ChatParticipant>> GetParticipantsAsync(long conversationId);
}

