using Microsoft.AspNetCore.Mvc;
using BusinessObject.Dtos;
using Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReadingHistoryController : ControllerBase
    {
        private readonly IReadingHistoryService _readingHistoryService;

        public ReadingHistoryController(IReadingHistoryService readingHistoryService)
        {
            _readingHistoryService = readingHistoryService;
        }

        /// <summary>
        /// Lấy lịch sử đọc/nghe của user hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetReadingHistory([FromQuery] ReadingHistoryFilterDTO? filter = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not found");
                }

                var readingHistory = await _readingHistoryService.GetReadingHistoryByUserIdAsync(userId.Value, filter);
                return Ok(readingHistory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy lịch sử đọc/nghe với phân trang
        /// </summary>
        [HttpGet("paginated")]
        public async Task<IActionResult> GetReadingHistoryPaginated([FromQuery] ReadingHistoryFilterDTO filter)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not found");
                }

                var result = await _readingHistoryService.GetReadingHistoryWithPaginationAsync(userId.Value, filter);
                return Ok(new
                {
                    Items = result.Items,
                    TotalCount = result.TotalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalPages = (int)Math.Ceiling((double)result.TotalCount / filter.PageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy chi tiết lịch sử đọc/nghe theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReadingHistoryById(long id)
        {
            try
            {
                var readingHistory = await _readingHistoryService.GetReadingHistoryByIdAsync(id);
                if (readingHistory == null)
                {
                    return NotFound("Reading history not found");
                }

                return Ok(readingHistory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy tiến độ đọc/nghe hiện tại của một sách/chương
        /// </summary>
        [HttpGet("current-progress")]
        public async Task<IActionResult> GetCurrentReadingProgress(
            [FromQuery] int bookId, 
            [FromQuery] int? chapterId = null, 
            [FromQuery] string readingType = "Reading")
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not found");
                }

                var progress = await _readingHistoryService.GetCurrentReadingProgressAsync(userId.Value, bookId, chapterId, readingType);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Tạo hoặc cập nhật lịch sử đọc/nghe
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReadingHistory([FromBody] CreateReadingHistoryDTO createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not found");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate ReadingType
                if (createDto.ReadingType != "Reading" && createDto.ReadingType != "Listening")
                {
                    return BadRequest("ReadingType must be 'Reading' or 'Listening'");
                }

                var result = await _readingHistoryService.CreateReadingHistoryAsync(createDto, userId.Value);
                return CreatedAtAction(nameof(GetReadingHistoryById), new { id = result.ReadingHistoryId }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Cập nhật lịch sử đọc/nghe
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReadingHistory(long id, [FromBody] UpdateReadingHistoryDTO updateDto)
        {
            try
            {
                if (id != updateDto.ReadingHistoryId)
                {
                    return BadRequest("ID mismatch");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _readingHistoryService.UpdateReadingHistoryAsync(updateDto);
                if (result == null)
                {
                    return NotFound("Reading history not found");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa lịch sử đọc/nghe
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReadingHistory(long id)
        {
            try
            {
                var result = await _readingHistoryService.DeleteReadingHistoryAsync(id);
                if (!result)
                {
                    return NotFound("Reading history not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Lưu tiến độ đọc/nghe (tự động tạo mới hoặc cập nhật)
        /// </summary>
        [HttpPost("save-progress")]
        public async Task<IActionResult> SaveReadingProgress([FromBody] CreateReadingHistoryDTO progressDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized("User not found");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate ReadingType
                if (progressDto.ReadingType != "Reading" && progressDto.ReadingType != "Listening")
                {
                    return BadRequest("ReadingType must be 'Reading' or 'Listening'");
                }

                var result = await _readingHistoryService.CreateReadingHistoryAsync(progressDto, userId.Value);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}
