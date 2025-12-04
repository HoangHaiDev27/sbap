using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{

    public class PromotionWithBookDTO
    {
        public int PromotionId { get; set; }
        public int OwnerId { get; set; }
        public string PromotionName { get; set; } = null!;
        public string? Description { get; set; }
        public decimal DiscountValue { get; set; }
        public DateTime StartAt { get; set; }
        public DateTime EndAt { get; set; }
        public bool IsActive { get; set; }

        public List<BookWithPromotionDTO> Books { get; set; } = new();
    }

}
