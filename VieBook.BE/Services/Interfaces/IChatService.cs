using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObject.Dtos;
using BusinessObject.Models;

namespace Services.Interfaces;

public interface IChatService
{
    Task<ChatMessageDTO> SendMessageAsync(int senderId, SendMessageRequest request);
    Task<List<ConversationListResponse>> GetUserConversationsAsync(int userId);
    Task<ChatHistoryResponse> GetChatHistoryAsync(int userId, long conversationId, int page = 1, int pageSize = 50);
    Task<long> GetOrCreateConversationAsync(int userId1, int userId2, string roleHint1, string roleHint2);
    Task<long> GetOrCreateGroupConversationAsync(List<int> userIds, Dictionary<int, string> roleHints);
    Task<ChatConversation?> GetConversationBetweenUsersAsync(int userId1, int userId2);
    Task<List<ChatConversation>> GetConversationsWithOwnerAsync(int ownerId);
    Task<bool> ConversationHasMessages(long conversationId);
    
    // Cho staff
    Task<List<OwnerChatItemDTO>> GetOwnerListForStaffAsync();
    Task<ChatHistoryResponse> GetChatHistoryForStaffAsync(int staffId, int ownerId, int page = 1, int pageSize = 50);
}

