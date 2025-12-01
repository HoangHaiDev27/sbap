using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.DAO.Staff
{
    public class BookApprovalDAO
    {
        private readonly VieBookContext _context;

        public BookApprovalDAO(VieBookContext context)
        {
            _context = context;
        }
        //lấy toàn bộ User kèm Profile
        public async Task<List<User>> GetAllUsersWithProfileAsync()
        {
            return await _context.Users
                .Include(u => u.UserProfile)
                .ToListAsync();
        }
        // Lấy tất cả sách có Status = "Active"
        public async Task<List<Book>> GetAllActiveAsync()
        {
            return await _context.Books
                .Where(b => b.Status == "Active")
                .Include(b => b.Owner)
                    .ThenInclude(o => o.UserProfile)
                .Include(b => b.Categories)
                .Include(b => b.Chapters)
                    .ThenInclude(ch => ch.OrderItems)
                .Include(b => b.BookReviews)
                .ToListAsync();
        }

        // Lấy tất cả BookApproval
        public async Task<List<BookApproval>> GetAllAsync()
        {
            return await _context.BookApprovals
                .Include(b => b.Book)
                .Include(b => b.Staff)
                    .ThenInclude(u => u.UserProfile)
                .ToListAsync();
        }

        // Lấy BookApproval theo Id
        public async Task<BookApproval?> GetByIdAsync(int id)
        {
            return await _context.BookApprovals
                .Include(b => b.Book)
                .Include(b => b.Staff)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(b => b.ApprovalId == id);
        }

        // Thêm mới BookApproval
        public async Task AddAsync(BookApproval bookApproval)
        {
            _context.BookApprovals.Add(bookApproval);
            await _context.SaveChangesAsync();
        }

        // Duyệt sách -> tạo dòng mới và set status sách
        public async Task<BookApproval> ApproveAsync(int bookId, int staffId)
        {
            var newApproval = new BookApproval
            {
                BookId = bookId,
                Action = "Approved",
                CreatedAt = DateTime.Now,
                StaffId = staffId
            };

            _context.BookApprovals.Add(newApproval);

            // Lấy Book với thông tin đầy đủ để có thể tạo thông báo
            var book = await _context.Books
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.BookId == bookId);
            
            if (book != null)
            {
                book.Status = "Approved";
            }

            await _context.SaveChangesAsync();
            return newApproval;
        }

        // Lấy Book với OwnerId và Title để tạo thông báo
        public async Task<Book?> GetBookWithOwnerAsync(int bookId)
        {
            return await _context.Books
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.BookId == bookId);
        }

        // Từ chối sách -> tạo dòng mới và set status sách
        public async Task<BookApproval> RefuseAsync(int bookId, int staffId, string? reason = null)
        {
            var newApproval = new BookApproval
            {
                BookId = bookId,
                Action = "Refused",
                CreatedAt = DateTime.Now,
                StaffId = staffId,
                Reason = reason
            };

            _context.BookApprovals.Add(newApproval);

            // Lấy Book với thông tin đầy đủ để có thể tạo thông báo
            var book = await _context.Books
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.BookId == bookId);
            
            if (book != null)
            {
                book.Status = "Refused";
            }

            await _context.SaveChangesAsync();
            return newApproval;
        }

        // Lấy BookApproval mới nhất theo BookId
        public async Task<BookApproval?> GetLatestByBookIdAsync(int bookId)
        {
            return await _context.BookApprovals
                .Where(b => b.BookId == bookId)
                .OrderByDescending(b => b.CreatedAt)
                .Include(b => b.Book)
                .Include(b => b.Staff)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync();
        }

        public async Task<Book?> GetBookByIdAsync(int bookId)
        {
            return await _context.Books.FindAsync(bookId);
        }
    }
}
