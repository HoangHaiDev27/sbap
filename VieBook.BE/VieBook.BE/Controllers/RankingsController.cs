using BusinessObject.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RankingsController : ControllerBase
    {
        private readonly IRankingService _rankingService;

        public RankingsController(IRankingService rankingService)
        {
            _rankingService = rankingService;
        }

        [HttpGet]
        public async Task<ActionResult<RankingSummaryDTO>> GetSummary()
        {
            var result = await _rankingService.GetRankingSummaryAsync();
            return Ok(result);
        }

        [HttpGet("details")]
        public async Task<ActionResult<RankingDetailDTO>> GetDetails()
        {
            var result = await _rankingService.GetRankingDetailsAsync();
            return Ok(result);
        }
    }
}
