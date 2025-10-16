using AutoMapper;
using BusinessObject.Dtos;
using Repositories.Implementations;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Implementations
{
    public class RankingService : IRankingService
    {
        private readonly IRankingRepository _rankRepo;
        private readonly IMapper _mapper;
        public RankingService(IRankingRepository rankRepo, IMapper mapper)
        {
            _rankRepo = rankRepo;
            _mapper = mapper;
        }
        public async Task<RankingSummaryDTO> GetRankingSummaryAsync()
        {
            var popularCount = await _rankRepo.CountPopularBooksAsync();
            var topRatedCount = await _rankRepo.CountTopRatedBooksAsync();
            var newReleaseCount = await _rankRepo.CountNewReleasesAsync();
            var trendingCount = await _rankRepo.CountTrendingBooksAsync();

            return new RankingSummaryDTO
            {
                PopularCount = popularCount,
                TopRatedCount = topRatedCount,
                NewReleaseCount = newReleaseCount,
                TrendingCount = trendingCount
            };
        }
        public async Task<RankingDetailDTO> GetRankingDetailsAsync()
        {
            const int TOP = 5;

            var popular = await _rankRepo.GetTopPopularBooksAsync(TOP);
            var rated = await _rankRepo.GetTopRatedBooksAsync(TOP);
            var newReleases = await _rankRepo.GetNewReleasesAsync(TOP);
            var trending = await _rankRepo.GetTrendingBooksAsync(TOP);

            return new RankingDetailDTO
            {
                PopularBooks = _mapper.Map<List<BookDTO>>(popular),
                TopRatedBooks = _mapper.Map<List<BookDTO>>(rated),
                NewReleaseBooks = _mapper.Map<List<BookDTO>>(newReleases),
                TrendingBooks = _mapper.Map<List<BookDTO>>(trending)
            };
        }
    }
}
