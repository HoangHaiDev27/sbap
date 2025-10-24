using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class ChatbaseDAO
    {
        private readonly VieBookContext _context;
        public ChatbaseDAO(VieBookContext context)
        {
            _context = context;
        }
        public async Task AddMessageAsync(int? userId, string message, string sender)
        {
            if (userId == null || userId == 0)
                return;
            var chat = new ChatbaseHistory
            {
                UserId = userId,
                Message = message,
                Sender = sender,
                CreatedAt = DateTime.Now
            };

            _context.ChatbaseHistories.Add(chat);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ChatbaseHistory>> GetHistoryByUserAsync(int? userId)
        {
            if (userId == null)
                return new List<ChatbaseHistory>();

            return await _context.ChatbaseHistories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }
    }
}
