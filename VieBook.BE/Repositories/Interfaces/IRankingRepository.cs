using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interfaces
{
    public interface IRankingRepository
    {
        Task<int> CountPopularBooksAsync();     // dựa trên TotalView
        Task<int> CountTopRatedBooksAsync();    // dựa trên rating trung bình >= 4
        Task<int> CountNewReleasesAsync();      // sách mới trong 30 ngày
        Task<int> CountTrendingBooksAsync();    // sách tăng view nhanh nhất
        Task<List<Book>> GetTopPopularBooksAsync(int top = 5);
        Task<List<Book>> GetTopRatedBooksAsync(int top = 5);
        Task<List<Book>> GetNewReleasesAsync(int top = 5);
        Task<List<Book>> GetTrendingBooksAsync(int top = 5);
    }
}
