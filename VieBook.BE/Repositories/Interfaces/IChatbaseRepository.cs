using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IChatbaseRepository
    {
        Task AddMessageAsync(int? userId, string message, string sender);
        Task<List<ChatbaseHistory>> GetHistoryByUserAsync(int? userId);
    }
}
