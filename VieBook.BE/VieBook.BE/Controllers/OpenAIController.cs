using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OpenAIController : ControllerBase
    {
        private readonly IOpenAIService _openAIService;
        public OpenAIController(IOpenAIService openAIService)
        {
            _openAIService = openAIService;
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("check-spelling")]
        public async Task<IActionResult> CheckSpelling([FromBody] CheckSpellingDto dto)
        {
            var result = await _openAIService.CheckSpellingAsync(dto);
            return Ok(result);
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("check-meaning")]
        public async Task<IActionResult> CheckMeaning([FromBody] CheckMeaningDto dto)
        {
            var result = await _openAIService.CheckMeaningAsync(dto);
            return Ok(result);
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("moderation")]
        public async Task<IActionResult> Moderation([FromBody] ModerationDto dto)
        {
            var result = await _openAIService.ModerationAsync(dto);
            return Ok(result);
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("check-plagiarism")]
        public async Task<IActionResult> CheckPlagiarism([FromBody] PlagiarismChapterContentCommand command)
        {
            var result = await _openAIService.CheckPlagiarismAsync(command);
            return Ok(result);
        }
        [Authorize(Roles = "Owner")]
        [HttpPost("generate-embeddings")]
        public async Task<IActionResult> GenerateEmbeddings([FromBody] GenerateEmbeddingsCommand command)
        {
            await _openAIService.GenerateAndSaveEmbeddingsAsync(command.ChapterId, command.Content);
            return Ok(new { message = "Embeddings generated and saved successfully" });
        }
        [HttpPost("summarize")]
        public async Task<IActionResult> Summarize([FromBody] SummarizeCommand command)
        {
            try
            {
                var summary = await _openAIService.SummarizeContentAsync(command);
                return Ok(new { summary });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}