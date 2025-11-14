using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChapterController : ControllerBase
    {
        private readonly IChapterService _chapterService;
        private readonly IMapper _mapper;

        public ChapterController(IChapterService chapterService, IMapper mapper)
        {
            _chapterService = chapterService;
            _mapper = mapper;
        }

        // GET api/chapter/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ChapterViewDTO>> GetChapterById(int id)
        {
            var chapter = await _chapterService.GetChapterByIdAsync(id);
            if (chapter == null) return NotFound(new { message = "Chapter not found" });

            var chapterDto = _mapper.Map<ChapterViewDTO>(chapter);
            return Ok(chapterDto);
        }

        // GET api/chapter/book/{bookId}
        [HttpGet("book/{bookId:int}")]
        public async Task<ActionResult<List<ChapterViewDTO>>> GetChaptersByBookId(int bookId)
        {
            var chapters = await _chapterService.GetChaptersByBookIdAsync(bookId);
            var chaptersDto = _mapper.Map<List<ChapterViewDTO>>(chapters);
            return Ok(chaptersDto);
        }

        // POST api/chapter
        [HttpPost]
        public async Task<ActionResult> AddChapter([FromBody] ChapterViewDTO chapterDto)
        {
            try
            {
                var chapter = _mapper.Map<Chapter>(chapterDto);
                await _chapterService.AddChapterAsync(chapter);
                return Ok(new { message = "Chapter added successfully", chapterId = chapter.ChapterId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while adding the chapter", error = ex.Message });
            }
        }

        // PUT api/chapter/{id}
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<ActionResult> UpdateChapter(int id, [FromBody] ChapterViewDTO chapterDto)
        {
            if (id != chapterDto.ChapterId)
                return BadRequest(new { message = "Invalid chapter ID" });

            var existing = await _chapterService.GetChapterByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Chapter not found" });
            _mapper.Map(chapterDto, existing);

            await _chapterService.UpdateChapterAsync(existing);

            return Ok(new { message = "Chapter updated successfully" });
        }

        // DELETE api/chapter/{id}
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<ActionResult> DeleteChapter(int id)
        {
            var existing = await _chapterService.GetChapterByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Chapter not found" });

            await _chapterService.DeleteChapterAsync(id);
            return Ok(new { message = "Chapter deleted successfully" });
        }

        // POST api/chapter/{id}/increment-view
        [HttpPost("{id:int}/increment-view")]
        public async Task<ActionResult> IncrementChapterView(int id)
        {
            try
            {
                var chapter = await _chapterService.GetChapterByIdAsync(id);
                if (chapter == null)
                    return NotFound(new { message = "Chapter not found" });

                await _chapterService.IncrementChapterViewAsync(id);
                return Ok(new { message = "Chapter view incremented successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
