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
        public Task AddMessageAsync(int? userId, string message, string sender) => _chatbaseDAO.AddMessageAsync(userId, message, sender);
        public Task<List<ChatbaseHistory>> GetHistoryByUserAsync(int? userId) => _chatbaseDAO.GetHistoryByUserAsync(userId);
    }
}
