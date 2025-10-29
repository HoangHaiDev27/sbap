namespace BusinessObject.Dtos
{
    public class PromotionCreateDTO
    {
        public int OwnerId { get; set; }
        public string PromotionName { get; set; } = null!;
        public string? Description { get; set; }
        public decimal DiscountPercent { get; set; }   // chỉ dùng percent
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public List<int> BookIds { get; set; } = new();
    }
}
