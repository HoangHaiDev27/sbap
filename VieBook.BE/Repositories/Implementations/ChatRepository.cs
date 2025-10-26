using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Models;
using DataAccess;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations;

public class ChatRepository : IChatRepository
{
    private readonly ChatDAO _chatDAO;

    public ChatRepository(VieBookContext context)
    {
        _chatDAO = new ChatDAO(context);
    }

    public async Task<ChatConversation?> GetConversationBetweenUsersAsync(int userId1, int userId2)
    {
        return await _chatDAO.GetConversationBetweenUsersAsync(userId1, userId2);
    }

    public async Task<ChatConversation> CreateConversationAsync(List<int> userIds, Dictionary<int, string>? roleHints = null)
    {
        return await _chatDAO.CreateConversationAsync(userIds, roleHints);
    }

    public async Task<ChatConversation?> GetConversationByIdAsync(long conversationId)
    {
        return await _chatDAO.GetConversationByIdAsync(conversationId);
    }

    public async Task<List<ChatConversation>> GetUserConversationsAsync(int userId)
    {
        return await _chatDAO.GetUserConversationsAsync(userId);
    }

    public async Task<List<ChatConversation>> GetConversationsWithOwnerAsync(int ownerId)
    {
        return await _chatDAO.GetConversationsWithOwnerAsync(ownerId);
    }

    public async Task<ChatMessage> SendMessageAsync(long conversationId, int senderId, string messageText, string? attachmentUrl = null)
    {
        return await _chatDAO.SendMessageAsync(conversationId, senderId, messageText, attachmentUrl);
    }

    public async Task<List<ChatMessage>> GetMessagesAsync(long conversationId, int pageSize = 50, int page = 1)
    {
        return await _chatDAO.GetMessagesAsync(conversationId, pageSize, page);
    }

    public async Task<bool> IsUserInConversationAsync(long conversationId, int userId)
    {
        return await _chatDAO.IsUserInConversationAsync(conversationId, userId);
    }

    public async Task<ChatMessage?> GetMessageByIdAsync(long messageId)
    {
        return await _chatDAO.GetMessageByIdAsync(messageId);
    }

    public async Task<List<(int OwnerId, long? ConversationId, DateTime? LastMessageTime, string? LastMessageText, int? LastStaffId)>> 
        GetOwnerConversationsForStaffAsync()
    {
        return await _chatDAO.GetOwnerConversationsForStaffAsync();
    }

    public async Task<List<ChatParticipant>> GetParticipantsAsync(long conversationId)
    {
        return await _chatDAO.GetParticipantsAsync(conversationId);
    }
}

