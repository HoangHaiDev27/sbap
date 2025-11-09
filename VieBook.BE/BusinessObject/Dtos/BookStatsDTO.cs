using System;

namespace BusinessObject.Dtos
{
    public class BookStatsDTO
    {
        public int BookId { get; set; }
        public int Purchases { get; set; }           // số order items thuộc các chapter của sách
        public decimal Revenue { get; set; }         // tổng CashSpent (xu)
        public double AverageRating { get; set; }    // trung bình Rating từ BookReviews
        public int TotalReads { get; set; }          // tổng ChapterView của các chapter
    }
}


