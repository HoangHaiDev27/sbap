using BusinessObject.Models;

namespace Service.Interfaces
{
    public interface IChatbaseService
    {
        Task<string> GetChatResponseAsync(string question, int? userId = null);
        Task<List<ChatbaseHistory>> GetChatHistoryAsync(int? userId);
    }
}