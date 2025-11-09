using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Implementations
{
    public class PostCommentService : IPostCommentService
    {
        private readonly IPostCommentRepository _postCommentRepository;
        private readonly IPostRepository _postRepository;
        private readonly IMapper _mapper;
        private readonly VieBookContext _context;

        public PostCommentService(
            IPostCommentRepository postCommentRepository,
            IPostRepository postRepository,
            IMapper mapper,
            VieBookContext context)
        {
            _postCommentRepository = postCommentRepository;
            _postRepository = postRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<PostCommentDTO?> GetByIdAsync(long commentId)
        {
            var comment = await _postCommentRepository.GetByIdAsync(commentId);
            if (comment == null) return null;
            return MapCommentWithReplies(comment);
        }

        public async Task<List<PostCommentDTO>> GetByPostIdAsync(long postId)
        {
            var comments = await _postCommentRepository.GetByPostIdAsync(postId);
            return comments.Select(MapCommentWithReplies).ToList();
        }

        public async Task<int> GetCommentCountByPostIdAsync(long postId)
        {
            return await _postCommentRepository.GetCommentCountByPostIdAsync(postId);
        }

        public async Task<PostCommentDTO> CreateAsync(CreatePostCommentDTO createDto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var comment = new PostComment
                {
                    PostId = createDto.PostId,
                    ParentCommentId = createDto.ParentCommentId,
                    UserId = userId,
                    Content = createDto.Content,
                    CreatedAt = DateTime.UtcNow
                };

                var createdComment = await _postCommentRepository.CreateAsync(comment);
                
                // Update post comment count
                var post = await _postRepository.GetByIdAsync(createDto.PostId);
                if (post != null)
                {
                    post.CommentCount = post.CommentCount + 1;
                    await _postRepository.UpdateAsync(post);
                }
                
                await transaction.CommitAsync();
                var commentWithUser = await _postCommentRepository.GetByIdAsync(createdComment.CommentId);
                return MapCommentWithReplies(commentWithUser!);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PostCommentDTO> UpdateAsync(long commentId, UpdatePostCommentDTO updateDto, int userId)
        {
            var comment = await _postCommentRepository.GetByIdAsync(commentId);
            if (comment == null)
                throw new Exception("Comment not found");

            if (comment.UserId != userId)
                throw new UnauthorizedAccessException("Not authorized to update this comment");

            comment.Content = updateDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            var updated = await _postCommentRepository.UpdateAsync(comment);
            return MapCommentWithReplies(updated);
        }

        public async Task<bool> DeleteAsync(long commentId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var comment = await _postCommentRepository.GetByIdAsync(commentId);
                if (comment == null)
                    return false;

                if (comment.UserId != userId)
                    throw new UnauthorizedAccessException("Not authorized to delete this comment");

                var deleted = await _postCommentRepository.DeleteAsync(commentId, userId);
                
                if (deleted)
                {
                    // Update post comment count
                    var post = await _postRepository.GetByIdAsync(comment.PostId);
                    if (post != null)
                    {
                        post.CommentCount = Math.Max(0, post.CommentCount - 1);
                        await _postRepository.UpdateAsync(post);
                    }
                }
                
                await transaction.CommitAsync();
                return deleted;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private PostCommentDTO MapCommentWithReplies(PostComment comment)
        {
            var dto = _mapper.Map<PostCommentDTO>(comment);
            if (comment.InverseParentComment != null && comment.InverseParentComment.Any())
            {
                dto.Replies = comment.InverseParentComment
                    .Where(reply => reply.DeletedAt == null)
                    .Select(MapCommentWithReplies)
                    .ToList();
            }
            return dto;
        }
    }
}


