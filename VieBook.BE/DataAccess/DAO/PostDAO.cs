using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class PostDAO
    {
        private readonly VieBookContext _context;

        public PostDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<Post?> GetByIdAsync(long postId)
        {
            return await _context.Posts
                .Include(p => p.Author)
                    .ThenInclude(a => a.UserProfile)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Chapter)
                .Include(p => p.PostAttachments)
                .FirstOrDefaultAsync(p => p.PostId == postId);
        }

        public async Task<List<Post>> GetPostsAsync(string? postType = null, string? searchQuery = null, string? tag = null, int? authorId = null, string? visibility = null)
        {
            var query = _context.Posts
                .Include(p => p.Author)
                    .ThenInclude(a => a.UserProfile)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Chapter)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.ChapterAudio)
                .Include(p => p.PostAttachments)
                .Where(p => p.DeletedAt == null)
                .AsQueryable();

            // Filter by visibility: if not specified, default to "Public" for regular users
            // Staff can specify "Pending" to see pending posts
            if (!string.IsNullOrEmpty(visibility))
            {
                query = query.Where(p => p.Visibility == visibility);
            }
            else
            {
                // Default: only show Public posts
                query = query.Where(p => p.Visibility == "Public");
            }

            if (!string.IsNullOrEmpty(postType))
            {
                query = query.Where(p => p.PostType == postType);
            }

            if (!string.IsNullOrEmpty(searchQuery))
            {
                var searchTerm = searchQuery.Trim();
                // Remove # if present at the start (for hashtag search)
                var tagSearchTerm = searchTerm.StartsWith("#") ? searchTerm.Substring(1) : searchTerm;
                
                query = query.Where(p => 
                    (p.Content != null && p.Content.Contains(searchTerm)) ||
                    (p.Title != null && p.Title.Contains(searchTerm)) ||
                    (p.Tags != null && (
                        // Search for exact tag match: "tag"
                        p.Tags.Contains($"\"{tagSearchTerm}\"") ||
                        // Search for partial match in tags (contains)
                        p.Tags.Contains(tagSearchTerm)
                    )));
            }

            // Filter by tag (search in JSON tags column)
            // The Tags column stores JSON array like ["tag1","tag2"], so we search for the tag in quotes
            if (!string.IsNullOrEmpty(tag))
            {
                // Search for the tag in the JSON string, ensuring it's a complete tag (not part of another tag)
                // Pattern: "tag" or "tag", or ["tag" or ,"tag" or "tag"] or "tag"}
                var tagPattern = $"\"{tag}\"";
                query = query.Where(p => p.Tags != null && p.Tags.Contains(tagPattern));
            }

            // Filter by author
            if (authorId.HasValue)
            {
                query = query.Where(p => p.AuthorId == authorId.Value);
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Post> CreateAsync(Post post)
        {
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<Post> UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<bool> DeleteAsync(long postId, int? deletedBy)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null)
                return false;

            post.DeletedAt = DateTime.UtcNow;
            post.DeletedBy = deletedBy;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Post>> GetPostsByClaimedUserAsync(int userId)
        {
            return await _context.Posts
                .Include(p => p.Author)
                    .ThenInclude(a => a.UserProfile)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Chapter)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.ChapterAudio)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.BookClaims)
                .Include(p => p.PostAttachments)
                .Where(p => p.DeletedAt == null && 
                           p.Visibility == "Public" &&
                           p.BookOffer != null &&
                           p.BookOffer.BookClaims.Any(bc => bc.CustomerId == userId))
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Post>> GetPostsByAuthorIdAsync(int authorId, bool includeHidden = false)
        {
            var query = _context.Posts
                .Include(p => p.Author)
                    .ThenInclude(a => a.UserProfile)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Book)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.Chapter)
                .Include(p => p.BookOffer)
                    .ThenInclude(bo => bo.ChapterAudio)
                .Include(p => p.PostAttachments)
                .Where(p => p.DeletedAt == null && p.AuthorId == authorId)
                .AsQueryable();

            // If includeHidden is false, only show public posts
            // If includeHidden is true, show only hidden posts
            if (includeHidden)
            {
                query = query.Where(p => p.Visibility == "Hidden");
            }
            else
            {
                query = query.Where(p => p.Visibility == "Public");
            }

            return await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}

