namespace BusinessObject.Dtos
{
    public class PaymentRequestDTO
    {
        public int Amount { get; set; }
    }

    public class CreatePaymentRequestDTO
    {
        public decimal RequestedCoin { get; set; }
    }

    public class PaymentRequestResponseDTO
    {
        public long PaymentRequestId { get; set; }
        public int UserId { get; set; }
        public decimal RequestedCoin { get; set; }
        public decimal AmountReceived { get; set; } // Số tiền nhận được sau khi trừ 10%
        public string Status { get; set; } = null!;
        public DateTime RequestDate { get; set; }
        public DateTime? AcceptDate { get; set; }
    }

    public class StaffPaymentRequestResponseDTO
    {
        public long PaymentRequestId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? BankName { get; set; }
        public string? BankNumber { get; set; }
        public decimal RequestedCoin { get; set; }
        public decimal AmountReceived { get; set; } // Số tiền nhận được sau khi trừ 10%
        public string Status { get; set; } = null!;
        public DateTime RequestDate { get; set; }
        public DateTime? AcceptDate { get; set; }
    }
}
