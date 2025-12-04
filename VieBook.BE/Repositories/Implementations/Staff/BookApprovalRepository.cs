using BusinessObject.Models;
using DataAccess.DAO.Staff;
using DataAccess;
using Repositories.Interfaces.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations.Staff
{
    public class BookApprovalRepository : IBookApprovalRepository
    {
        private readonly BookApprovalDAO _dao;

        public BookApprovalRepository(VieBookContext context)
        {
            _dao = new BookApprovalDAO(context);
        }

        public Task<List<BookApproval>> GetAllAsync()
            => _dao.GetAllAsync();

        public Task<BookApproval?> GetByIdAsync(int id)
            => _dao.GetByIdAsync(id);

        public Task AddAsync(BookApproval bookApproval)
            => _dao.AddAsync(bookApproval);

        public Task ApproveAsync(int bookId, int staffId)
            => _dao.ApproveAsync(bookId, staffId);

        public Task RefuseAsync(int bookId, int staffId, string? reason = null)
            => _dao.RefuseAsync(bookId, staffId, reason);

        public Task<BookApproval?> GetLatestByBookIdAsync(int bookId)
            => _dao.GetLatestByBookIdAsync(bookId);

        public Task<List<Book>> GetAllActiveAsync()
            => _dao.GetAllActiveAsync();

        public Task<List<User>> GetAllUsersWithProfileAsync()
            => _dao.GetAllUsersWithProfileAsync();

        public Task<Book?> GetBookByIdAsync(int bookId)
            => _dao.GetBookByIdAsync(bookId);

        public Task<Book?> GetBookWithOwnerAsync(int bookId)
            => _dao.GetBookWithOwnerAsync(bookId);
    }
}
