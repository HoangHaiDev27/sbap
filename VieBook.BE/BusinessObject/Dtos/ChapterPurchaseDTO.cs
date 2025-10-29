using System;
using System.Collections.Generic;

namespace BusinessObject.Dtos
{
    public class ChapterPurchaseRequestDTO
    {
        public List<int> ChapterIds { get; set; } = new List<int>();
        public int BookId { get; set; }
        public string PurchaseType { get; set; } = "soft"; // "soft", "audio", hoặc "both"
    }

    public class ChapterPurchaseResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public decimal RemainingBalance { get; set; }
        public List<OrderItemDTO> PurchasedItems { get; set; } = new List<OrderItemDTO>();
    }

    public class OrderItemDTO
    {
        public long OrderItemId { get; set; }
        public int ChapterId { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
        public int BookId { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal CashSpent { get; set; }
        public DateTime PaidAt { get; set; }
        public string OrderType { get; set; } = string.Empty;
    }
}
