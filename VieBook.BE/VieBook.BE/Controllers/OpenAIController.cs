using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObject.Dtos.OpenAI;
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
        [HttpPost("check-spelling")]
        public async Task<IActionResult> CheckSpelling([FromBody] CheckSpellingDto dto)
        {
            var result = await _openAIService.CheckSpellingAsync(dto);
            return Ok(result);
        }
        [HttpPost("moderation")]
        public async Task<IActionResult> Moderation([FromBody] ModerationDto dto)
        {
            var result = await _openAIService.ModerationAsync(dto);
            return Ok(result);
        }

        [HttpPost("check-plagiarism")]
        public async Task<IActionResult> CheckPlagiarism([FromBody] PlagiarismChapterContentCommand command)
        {
            var result = await _openAIService.CheckPlagiarismAsync(command);
            return Ok(result);
        }

        [HttpPost("generate-embeddings")]
        public async Task<IActionResult> GenerateEmbeddings([FromBody] GenerateEmbeddingsCommand command)
        {
            await _openAIService.GenerateAndSaveEmbeddingsAsync(command.ChapterId, command.Content);
            return Ok(new { message = "Embeddings generated and saved successfully" });
        }
    }
}