using BusinessObject.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IReadingStatsService
    {
        Task<int> GetBooksReadCountAsync(int userId);
        Task<int> GetBooksPurchasedCountAsync(int userId);
        Task<int> GetFavoritesCountAsync(int userId);
        Task<int> GetBooksListenedCountAsync(int userId);
    }
}
