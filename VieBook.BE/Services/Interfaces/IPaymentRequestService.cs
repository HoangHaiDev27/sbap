using BusinessObject.Dtos;

namespace Services.Interfaces
{
    public interface IPaymentRequestService
    {
        Task<PaymentRequestResponseDTO> CreatePaymentRequestAsync(int userId, CreatePaymentRequestDTO createDto);
        Task<List<PaymentRequestResponseDTO>> GetPaymentRequestsByUserIdAsync(int userId);
        Task<PaymentRequestResponseDTO?> GetPaymentRequestByIdAsync(long paymentRequestId);
        Task<List<StaffPaymentRequestResponseDTO>> GetAllPaymentRequestsAsync();
        Task<bool> ApprovePaymentRequestAsync(long paymentRequestId, int staffId);
        Task<bool> RejectPaymentRequestAsync(long paymentRequestId, int staffId, string? reason = null);
    }
}

