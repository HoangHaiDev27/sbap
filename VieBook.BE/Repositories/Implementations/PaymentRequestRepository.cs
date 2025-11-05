using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;

namespace Repositories.Implementations
{
    public class PaymentRequestRepository : IPaymentRequestRepository
    {
        private readonly PaymentRequestDAO _dao;

        public PaymentRequestRepository(PaymentRequestDAO dao)
        {
            _dao = dao;
        }

        public async Task<PaymentRequest> CreatePaymentRequestAsync(PaymentRequest paymentRequest)
        {
            return await _dao.CreatePaymentRequestAsync(paymentRequest);
        }

        public async Task<List<PaymentRequest>> GetPaymentRequestsByUserIdAsync(int userId)
        {
            return await _dao.GetPaymentRequestsByUserIdAsync(userId);
        }

        public async Task<PaymentRequest?> GetPaymentRequestByIdAsync(long paymentRequestId)
        {
            return await _dao.GetPaymentRequestByIdAsync(paymentRequestId);
        }

        public async Task<List<PaymentRequest>> GetAllPaymentRequestsAsync()
        {
            return await _dao.GetAllPaymentRequestsAsync();
        }

        public async Task<bool> ApprovePaymentRequestAsync(long paymentRequestId, int staffId)
        {
            return await _dao.ApprovePaymentRequestAsync(paymentRequestId, staffId);
        }

        public async Task<bool> RejectPaymentRequestAsync(long paymentRequestId, int staffId, string? reason = null)
        {
            return await _dao.RejectPaymentRequestAsync(paymentRequestId, staffId, reason);
        }
    }
}

