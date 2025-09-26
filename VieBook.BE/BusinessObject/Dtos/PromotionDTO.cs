namespace BusinessObject.Dtos
{
    public class PromotionDTO
    {
        public int PromotionId { get; set; }
        public int OwnerId { get; set; }
        public string PromotionName { get; set; } = null!;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = null!;
        public decimal DiscountValue { get; set; }
        public int Quantity { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public bool IsActive { get; set; }

        // 1 promotion chỉ có 1 book
        public BookWithPromotionDTO? Book { get; set; }
    }
}
