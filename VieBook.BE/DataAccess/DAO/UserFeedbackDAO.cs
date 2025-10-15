using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace DataAccess.DAO
{
    public class UserFeedbackDAO
    {
        private readonly VieBookContext _context;

        public UserFeedbackDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<UserFeedback> AddAsync(UserFeedback feedback)
        {
            _context.UserFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }
    }
}
