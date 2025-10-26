using BusinessObject.Models;
using Repositories.Interfaces.Staff;
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

        public BookApprovalService(IBookApprovalRepository repository)
        {
            _repository = repository;
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

        public Task ApproveAsync(int bookId, int staffId)
            => _repository.ApproveAsync(bookId, staffId);

        public Task RefuseAsync(int bookId, int staffId, string? reason = null)
            => _repository.RefuseAsync(bookId, staffId, reason);

        public Task<BookApproval?> GetLatestByBookIdAsync(int bookId)
            => _repository.GetLatestByBookIdAsync(bookId);

        public Task<List<Book>> GetAllActiveAsync()
            => _repository.GetAllActiveAsync();

        public Task<List<User>> GetAllUsersWithProfileAsync()
            => _repository.GetAllUsersWithProfileAsync();
    }
}
