using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObject.Models;

namespace BusinessObject.Dtos
{
    public class AdminStatisticDTO
    {
        public int TotalBooks { get; set; }
        public double BooksChangePercent { get; set; }

        public int AudioBooks { get; set; }
        public double AudioChangePercent { get; set; }

        public int BookOwners { get; set; }
        public double BookOwnerChangePercent { get; set; }

        public int Customers { get; set; }
        public double CustomerChangePercent { get; set; }

        public int Staffs { get; set; }
        public double StaffChangePercent { get; set; }

        public int MonthlyTransactions { get; set; }
        public double TransactionChangePercent { get; set; }

        public decimal MonthlyRevenue { get; set; }
        public double RevenueChangePercent { get; set; }

        public double PositiveFeedbackPercent { get; set; }
        public double NegativeFeedbackPercent { get; set; }
        public double FeedbackChangePercent { get; set; }

        public double AverageRating { get; set; }
        public string Message { get; set; } = string.Empty;

        public List<BookByMonthDTO>? BooksByMonthData { get; set; }
        public List<RevenueByMonthDTO>? RevenueData { get; set; }
        public List<CategoryDistributionDTO>? CategoryDistribution { get; set; }
    }

    public class BookByMonthDTO
    {
        public string Month { get; set; } = string.Empty;
        public int Books { get; set; }
    }

    public class RevenueByMonthDTO
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
    }

    public class CategoryDistributionDTO
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
    
}
