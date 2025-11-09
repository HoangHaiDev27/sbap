using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class PostReactionDAO
    {
        private readonly VieBookContext _context;

        public PostReactionDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<PostReaction?> GetByPostAndUserAsync(long postId, int userId)
        {
            return await _context.PostReactions
                .Include(pr => pr.User)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(pr => pr.PostId == postId && pr.UserId == userId);
        }

        public async Task<List<PostReaction>> GetByPostIdAsync(long postId)
        {
            return await _context.PostReactions
                .Include(pr => pr.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(pr => pr.PostId == postId)
                .ToListAsync();
        }

        public async Task<int> GetReactionCountByPostIdAsync(long postId)
        {
            return await _context.PostReactions
                .CountAsync(pr => pr.PostId == postId);
        }

        public async Task<PostReaction> CreateAsync(PostReaction reaction)
        {
            _context.PostReactions.Add(reaction);
            await _context.SaveChangesAsync();
            return reaction;
        }

        public async Task<bool> DeleteAsync(long postId, int userId)
        {
            var reaction = await _context.PostReactions
                .FirstOrDefaultAsync(pr => pr.PostId == postId && pr.UserId == userId);
            
            if (reaction == null)
                return false;

            _context.PostReactions.Remove(reaction);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateReactionTypeAsync(long postId, int userId, string reactionType)
        {
            var reaction = await _context.PostReactions
                .FirstOrDefaultAsync(pr => pr.PostId == postId && pr.UserId == userId);
            
            if (reaction == null)
                return false;

            reaction.ReactionType = reactionType;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}


