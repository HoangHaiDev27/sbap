using BusinessObject.Models;
using DataAccess.DAO;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Implementations
{
    public class RankingRepository : IRankingRepository
    {
        private readonly RankingSummaryDAO _rankDAO;
        public RankingRepository(RankingSummaryDAO rankRepo)
        {
            _rankDAO = rankRepo;
        }
        public Task<int> CountPopularBooksAsync() =>  _rankDAO.CountPopularBooksAsync();
        public Task<int> CountTopRatedBooksAsync() => _rankDAO.CountTopRatedBooksAsync();
        public Task<int> CountNewReleasesAsync() => _rankDAO.CountNewReleasesAsync();
        public Task<int> CountTrendingBooksAsync() => _rankDAO.CountTrendingBooksAsync();
        public Task<List<Book>> GetTopPopularBooksAsync(int top = 5) => _rankDAO.GetTopPopularBooksAsync(top);
        public Task<List<Book>> GetTopRatedBooksAsync(int top = 5) =>  _rankDAO.GetTopRatedBooksAsync(top);
        public Task<List<Book>> GetNewReleasesAsync(int top = 5) => _rankDAO.GetNewReleasesAsync(top);
        public Task<List<Book>> GetTrendingBooksAsync(int top = 5) => _rankDAO.GetTrendingBooksAsync(top);
    }
}
