using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class ChatbaseRepository : IChatbaseRepository
    {
        private readonly ChatbaseDAO _chatbaseDAO;
        public ChatbaseRepository(ChatbaseDAO chatbaseDAO)
        {
            _chatbaseDAO = chatbaseDAO;
        }
        public async Task AddMessageAsync(int? userId, string message, string sender) => await _chatbaseDAO.AddMessageAsync(userId, message, sender);
        public async Task<List<ChatbaseHistory>> GetHistoryByUserAsync(int? userId) => await _chatbaseDAO.GetHistoryByUserAsync(userId);
    }
}
