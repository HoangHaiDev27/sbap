using BusinessObject.Models;

namespace Repositories.Interfaces
{
    public interface IPaymentRequestRepository
    {
        Task<PaymentRequest> CreatePaymentRequestAsync(PaymentRequest paymentRequest);
        Task<List<PaymentRequest>> GetPaymentRequestsByUserIdAsync(int userId);
        Task<PaymentRequest?> GetPaymentRequestByIdAsync(long paymentRequestId);
        Task<List<PaymentRequest>> GetAllPaymentRequestsAsync();
        Task<bool> ApprovePaymentRequestAsync(long paymentRequestId, int staffId);
        Task<bool> RejectPaymentRequestAsync(long paymentRequestId, int staffId, string? reason = null);
    }
}

