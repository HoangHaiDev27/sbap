using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using DataAccess;

namespace DataAccess.DAO
{
    public class PaymentRequestDAO
    {
        private readonly VieBookContext _context;

        public PaymentRequestDAO(VieBookContext context)
        {
            _context = context;
        }

        public async Task<PaymentRequest> CreatePaymentRequestAsync(PaymentRequest paymentRequest)
        {
            // RequestDate và Status đã được set trong Service layer, không cần set lại
            // Chỉ đảm bảo nếu chưa được set thì mới set
            if (paymentRequest.RequestDate == default(DateTime))
            {
                paymentRequest.RequestDate = DateTime.UtcNow;
            }
            if (string.IsNullOrEmpty(paymentRequest.Status))
            {
                paymentRequest.Status = "Pending";
            }
            _context.PaymentRequests.Add(paymentRequest);
            await _context.SaveChangesAsync();
            return paymentRequest;
        }

        public async Task<List<PaymentRequest>> GetPaymentRequestsByUserIdAsync(int userId)
        {
            return await _context.PaymentRequests
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.RequestDate)
                .ToListAsync();
        }

        public async Task<PaymentRequest?> GetPaymentRequestByIdAsync(long paymentRequestId)
        {
            return await _context.PaymentRequests
                .Include(pr => pr.User)
                    .ThenInclude(u => u.UserProfile)
                .FirstOrDefaultAsync(pr => pr.PaymentRequestId == paymentRequestId);
        }

        public async Task<List<PaymentRequest>> GetAllPaymentRequestsAsync()
        {
            return await _context.PaymentRequests
                .Include(pr => pr.User)
                    .ThenInclude(u => u.UserProfile)
                .OrderByDescending(pr => pr.RequestDate)
                .ToListAsync();
        }

        public async Task<bool> ApprovePaymentRequestAsync(long paymentRequestId, int staffId)
        {
            var paymentRequest = await _context.PaymentRequests
                .FirstOrDefaultAsync(pr => pr.PaymentRequestId == paymentRequestId);

            if (paymentRequest == null)
                return false;

            paymentRequest.Status = "Succeeded";
            paymentRequest.AcceptDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectPaymentRequestAsync(long paymentRequestId, int staffId, string? reason = null)
        {
            var paymentRequest = await _context.PaymentRequests
                .FirstOrDefaultAsync(pr => pr.PaymentRequestId == paymentRequestId);

            if (paymentRequest == null)
                return false;

            paymentRequest.Status = "Rejected";
            paymentRequest.AcceptDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

