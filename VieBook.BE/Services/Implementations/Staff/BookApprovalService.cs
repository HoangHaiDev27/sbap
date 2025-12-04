using BusinessObject.Models;
using Repositories.Interfaces.Staff;
using Services.Interfaces;
using Services.Interfaces.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations.Staff
{
    public class BookApprovalService : IBookApprovalService
    {
        private readonly IBookApprovalRepository _repository;
        private readonly INotificationService _notificationService;

        public BookApprovalService(IBookApprovalRepository repository, INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        public Task<List<BookApproval>> GetAllAsync()
            => _repository.GetAllAsync();

        public Task<BookApproval?> GetByIdAsync(int id)
            => _repository.GetByIdAsync(id);

        public async Task AddAsync(BookApproval bookApproval)
        {
            // Set the navigation property to avoid validation errors
            if (bookApproval.Book == null)
            {
                // Load the book to set the navigation property
                var book = await _repository.GetBookByIdAsync(bookApproval.BookId);
                if (book != null)
                {
                    bookApproval.Book = book;
                }
            }

            await _repository.AddAsync(bookApproval);
        }

        public async Task ApproveAsync(int bookId, int staffId)
        {
            // Duyệt sách
            await _repository.ApproveAsync(bookId, staffId);

            // Lấy thông tin sách để tạo thông báo cho owner
            var book = await _repository.GetBookWithOwnerAsync(bookId);
            if (book != null && !string.IsNullOrEmpty(book.Title))
            {
                // Tạo thông báo cho người sở hữu sách
                await _notificationService.CreateBookApprovalNotificationAsync(
                    book.OwnerId,
                    book.Title,
                    approved: true
                );
            }
        }

        public async Task RefuseAsync(int bookId, int staffId, string? reason = null)
        {
            // Từ chối sách
            await _repository.RefuseAsync(bookId, staffId, reason);

            // Lấy thông tin sách để tạo thông báo cho owner
            var book = await _repository.GetBookWithOwnerAsync(bookId);
            if (book != null && !string.IsNullOrEmpty(book.Title))
            {
                // Tạo thông báo cho người sở hữu sách
                await _notificationService.CreateBookApprovalNotificationAsync(
                    book.OwnerId,
                    book.Title,
                    approved: false
                );
            }
        }

        public Task<BookApproval?> GetLatestByBookIdAsync(int bookId)
            => _repository.GetLatestByBookIdAsync(bookId);

        public Task<List<Book>> GetAllActiveAsync()
            => _repository.GetAllActiveAsync();

        public Task<List<User>> GetAllUsersWithProfileAsync()
            => _repository.GetAllUsersWithProfileAsync();
    }
}
