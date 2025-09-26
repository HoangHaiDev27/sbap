using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Dtos
{
    public class BookApprovalDTO
    {
        public int ApprovalId { get; set; }
        public int BookId { get; set; }
        public int StaffId { get; set; }
        public string Action { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Thông tin staff
        public string StaffName { get; set; } = null!;
    }
}
