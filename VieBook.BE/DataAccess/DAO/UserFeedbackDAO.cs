using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<List<UserFeedbackDTO>> GetAllForStaffAsync()
        {
            var feedbacks = await _context.UserFeedbacks
                .Include(f => f.FromUser)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.DeletedAt == null) // Chỉ lấy feedback chưa bị xóa
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            // Lấy danh sách book IDs cần thiết
            var bookIds = feedbacks
                .Where(f => f.TargetType == "Book" && f.TargetId.HasValue)
                .Select(f => f.TargetId.Value)
                .Distinct()
                .ToList();

            // Load books một lần
            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .Select(b => new { b.BookId, b.Title })
                .ToDictionaryAsync(b => b.BookId, b => b.Title);

            // Map sang DTO
            return feedbacks.Select(f => new UserFeedbackDTO
            {
                FeedbackId = f.FeedbackId,
                FromUserId = f.FromUserId,
                FromUserName = f.FromUser != null && f.FromUser.UserProfile != null 
                    ? f.FromUser.UserProfile.FullName 
                    : f.FromUser != null ? f.FromUser.Email : null,
                FromUserEmail = f.FromUser != null ? f.FromUser.Email : null,
                FromUserAvatarUrl = f.FromUser != null && f.FromUser.UserProfile != null 
                    ? f.FromUser.UserProfile.AvatarUrl 
                    : null,
                Content = f.Content,
                TargetType = f.TargetType,
                TargetId = f.TargetId,
                TargetBookTitle = f.TargetType == "Book" && f.TargetId.HasValue && books.ContainsKey(f.TargetId.Value)
                    ? books[f.TargetId.Value]
                    : null,
                CreatedAt = f.CreatedAt,
                DeletedBy = f.DeletedBy,
                DeletedAt = f.DeletedAt
            }).ToList();
        }

        public async Task<(List<UserFeedbackDTO> Feedbacks, int TotalCount)> GetAllForStaffPagedAsync(
            int page = 1, 
            int pageSize = 10, 
            string? searchTerm = null, 
            int? bookId = null)
        {
            var query = _context.UserFeedbacks
                .Include(f => f.FromUser)
                    .ThenInclude(u => u.UserProfile)
                .Where(f => f.DeletedAt == null && f.TargetType != "System"); // Chỉ lấy feedback chưa bị xóa và không phải System

            // Filter by bookId
            if (bookId.HasValue)
            {
                query = query.Where(f => f.TargetType == "Book" && f.TargetId == bookId.Value);
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(f => 
                    (f.FromUser != null && f.FromUser.UserProfile != null && f.FromUser.UserProfile.FullName.ToLower().Contains(search)) ||
                    (f.FromUser != null && f.FromUser.Email.ToLower().Contains(search)) ||
                    (f.Content.ToLower().Contains(search))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var feedbacks = await query
                .OrderByDescending(f => f.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Lấy danh sách book IDs cần thiết
            var bookIds = feedbacks
                .Where(f => f.TargetType == "Book" && f.TargetId.HasValue)
                .Select(f => f.TargetId.Value)
                .Distinct()
                .ToList();

            // Load books một lần
            var books = await _context.Books
                .Where(b => bookIds.Contains(b.BookId))
                .Select(b => new { b.BookId, b.Title })
                .ToDictionaryAsync(b => b.BookId, b => b.Title);

            // Map sang DTO
            var feedbackDtos = feedbacks.Select(f => new UserFeedbackDTO
            {
                FeedbackId = f.FeedbackId,
                FromUserId = f.FromUserId,
                FromUserName = f.FromUser != null && f.FromUser.UserProfile != null 
                    ? f.FromUser.UserProfile.FullName 
                    : f.FromUser != null ? f.FromUser.Email : null,
                FromUserEmail = f.FromUser != null ? f.FromUser.Email : null,
                FromUserAvatarUrl = f.FromUser != null && f.FromUser.UserProfile != null 
                    ? f.FromUser.UserProfile.AvatarUrl 
                    : null,
                Content = f.Content,
                TargetType = f.TargetType,
                TargetId = f.TargetId,
                TargetBookTitle = f.TargetType == "Book" && f.TargetId.HasValue && books.ContainsKey(f.TargetId.Value)
                    ? books[f.TargetId.Value]
                    : null,
                CreatedAt = f.CreatedAt,
                DeletedBy = f.DeletedBy,
                DeletedAt = f.DeletedAt
            }).ToList();

            return (feedbackDtos, totalCount);
        }

        public async Task<bool> DeleteAsync(int feedbackId, int? deletedBy = null)
        {
            try
            {
                var feedback = await _context.UserFeedbacks
                    .FirstOrDefaultAsync(f => f.FeedbackId == feedbackId && f.DeletedAt == null);
                
                if (feedback == null) return false;

                // Soft delete: set DeletedAt and DeletedBy
                feedback.DeletedAt = DateTime.UtcNow;
                feedback.DeletedBy = deletedBy;
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa UserFeedback: {ex.Message}");
                return false;
            }
        }

        public async Task<int> GetTotalCountForStaffAsync(string? searchTerm = null, int? bookId = null)
        {
            // Sử dụng query trực tiếp không cần Include vì CountAsync chỉ cần đếm
            var query = _context.UserFeedbacks
                .Where(f => f.DeletedAt == null && f.TargetType != "System"); // Chỉ lấy feedback chưa bị xóa và không phải System

            // Filter by bookId (chỉ áp dụng khi targetType là "Book")
            if (bookId.HasValue)
            {
                query = query.Where(f => f.TargetType == "Book" && f.TargetId == bookId.Value);
            }

            // Search filter - EF Core sẽ tự động join khi filter trên navigation properties
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var search = searchTerm.ToLower();
                query = query.Where(f =>
                    (f.FromUser != null && f.FromUser.UserProfile != null && f.FromUser.UserProfile.FullName != null && f.FromUser.UserProfile.FullName.ToLower().Contains(search)) ||
                    (f.FromUser != null && f.FromUser.Email != null && f.FromUser.Email.ToLower().Contains(search)) ||
                    (f.Content != null && f.Content.ToLower().Contains(search))
                );
            }

            return await query.CountAsync();
        }
    }
}
