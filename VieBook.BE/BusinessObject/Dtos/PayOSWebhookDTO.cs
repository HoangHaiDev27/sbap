namespace BusinessObject.Dtos
{
    public class PayOSWebhookDTO
    {
        public int OrderCode { get; set; }
        public decimal AmountMoney { get; set; }
        public decimal AmountCoin { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? PaymentMethod { get; set; }
        public int? UserId { get; set; }
    }
}
