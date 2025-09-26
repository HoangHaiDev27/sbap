using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces.Staff
{
    public interface IBookApprovalRepository
    {
        Task<List<User>> GetAllUsersWithProfileAsync();
        Task<List<Book>> GetAllActiveAsync();
        Task<List<BookApproval>> GetAllAsync();
        Task<BookApproval?> GetByIdAsync(int id);
        Task AddAsync(BookApproval bookApproval);
        Task ApproveAsync(int bookId, int staffId);
        Task RefuseAsync(int bookId, int staffId, string? reason = null);
        Task<BookApproval?> GetLatestByBookIdAsync(int bookId);
    }
}
