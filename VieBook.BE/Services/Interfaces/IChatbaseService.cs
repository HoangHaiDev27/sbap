using BusinessObject.Models;

namespace Service.Interfaces
{
    public interface IChatbaseService
    {
        Task<string> GetChatResponseAsync(string question, string frontendUrl, int? userId = null);
        Task<List<ChatbaseHistory>> GetChatHistoryAsync(int? userId);
    }
}