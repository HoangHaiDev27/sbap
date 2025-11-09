using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class PostCommentDAO
    {
        private readonly VieBookContext _context;

        public PostCommentDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<PostComment?> GetByIdAsync(long commentId)
        {
            return await _context.PostComments
                .Include(pc => pc.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(pc => pc.InverseParentComment)
                    .ThenInclude(reply => reply.User)
                        .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(pc => pc.CommentId == commentId && pc.DeletedAt == null);
        }

        public async Task<List<PostComment>> GetByPostIdAsync(long postId)
        {
            return await _context.PostComments
                .Include(pc => pc.User)
                    .ThenInclude(u => u.UserProfile)
                .Include(pc => pc.InverseParentComment)
                    .ThenInclude(reply => reply.User)
                        .ThenInclude(u => u.UserProfile)
                .Where(pc => pc.PostId == postId && 
                            pc.DeletedAt == null && 
                            pc.ParentCommentId == null) // Only top-level comments
                .OrderByDescending(pc => pc.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<PostComment>> GetRepliesByCommentIdAsync(long parentCommentId)
        {
            return await _context.PostComments
                .Include(pc => pc.User)
                    .ThenInclude(u => u.UserProfile)
                .Where(pc => pc.ParentCommentId == parentCommentId && pc.DeletedAt == null)
                .OrderBy(pc => pc.CreatedAt)
                .ToListAsync();
        }

        public async Task<int> GetCommentCountByPostIdAsync(long postId)
        {
            return await _context.PostComments
                .CountAsync(pc => pc.PostId == postId && pc.DeletedAt == null);
        }

        public async Task<PostComment> CreateAsync(PostComment comment)
        {
            _context.PostComments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<PostComment> UpdateAsync(PostComment comment)
        {
            _context.PostComments.Update(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<bool> DeleteAsync(long commentId, int? deletedBy)
        {
            var comment = await _context.PostComments.FindAsync(commentId);
            if (comment == null)
                return false;

            comment.DeletedAt = DateTime.UtcNow;
            comment.DeletedBy = deletedBy;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}


