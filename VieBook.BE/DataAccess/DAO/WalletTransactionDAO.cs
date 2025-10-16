using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess;

namespace DataAccess.DAO
{
    public class WalletTransactionDAO
    {
        private readonly VieBookContext _context;

        public WalletTransactionDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<WalletTransaction?> GetByTransactionIdAsync(string transactionId)
        {
            return await _context.WalletTransactions
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.TransactionId == transactionId);
        }

        public async Task<WalletTransaction> CreateAsync(WalletTransaction walletTransaction)
        {
            _context.WalletTransactions.Add(walletTransaction);
            await _context.SaveChangesAsync();
            return walletTransaction;
        }

        public async Task<WalletTransaction> UpdateAsync(WalletTransaction walletTransaction)
        {
            _context.WalletTransactions.Update(walletTransaction);
            await _context.SaveChangesAsync();
            return walletTransaction;
        }

        public async Task<bool> ExistsAsync(string transactionId)
        {
            return await _context.WalletTransactions.AnyAsync(w => w.TransactionId == transactionId);
        }

        public async Task<List<WalletTransaction>> GetByUserIdAsync(int userId)
        {
            return await _context.WalletTransactions
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
        }
    }
}


