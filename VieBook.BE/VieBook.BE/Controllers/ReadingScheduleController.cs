using AutoMapper;
using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReadingScheduleController : ControllerBase
    {
        private readonly IReadingScheduleService _readingScheduleService;
        private readonly IMapper _mapper;

        public ReadingScheduleController(IReadingScheduleService readingScheduleService, IMapper mapper)
        {
            _readingScheduleService = readingScheduleService;
            _mapper = mapper;
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<ReadingScheduleDTO>>> GetReadingSchedulesByUserId(int userId)
        {
            try
            {
                var schedules = await _readingScheduleService.GetReadingSchedulesByUserIdAsync(userId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("user/{userId:int}/date/{date:datetime}")]
        public async Task<ActionResult<IEnumerable<ReadingScheduleDTO>>> GetReadingSchedulesByDate(int userId, DateTime date)
        {
            try
            {
                var schedules = await _readingScheduleService.GetReadingSchedulesByDateAsync(userId, date);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReadingScheduleDTO>> GetReadingSchedule(int id)
        {
            try
            {
                var schedule = await _readingScheduleService.GetReadingScheduleByIdAsync(id);
                if (schedule == null)
                    return NotFound(new { message = "Reading schedule not found" });

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<ActionResult<ReadingScheduleDTO>> CreateReadingSchedule([FromBody] CreateReadingScheduleDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });
                }

                // Get user ID from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                    ?? User.FindFirst("sub")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Token không hợp lệ" });
                }

                var schedule = await _readingScheduleService.CreateReadingScheduleAsync(createDto, userId);
                return CreatedAtAction(nameof(GetReadingSchedule), new { id = schedule.ScheduleId }, schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ReadingScheduleDTO>> UpdateReadingSchedule(int id, [FromBody] UpdateReadingScheduleDTO updateDto)
        {
            try
            {
                var schedule = await _readingScheduleService.UpdateReadingScheduleAsync(id, updateDto);
                if (schedule == null)
                    return NotFound(new { message = "Reading schedule not found" });

                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReadingSchedule(int id)
        {
            try
            {
                // Get userId from JWT token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Check if schedule exists and belongs to user
                var schedule = await _readingScheduleService.GetReadingScheduleByIdAsync(id);
                if (schedule == null)
                    return NotFound(new { message = "Reading schedule not found" });
                
                if (schedule.UserId != userId)
                    return Forbid(); // 403 Forbidden if trying to delete someone else's schedule

                var result = await _readingScheduleService.DeleteReadingScheduleAsync(id);
                if (!result)
                    return NotFound(new { message = "Reading schedule not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("{id:int}/complete")]
        public async Task<IActionResult> MarkScheduleCompleted(int id)
        {
            try
            {
                var result = await _readingScheduleService.MarkScheduleCompletedAsync(id);
                if (!result)
                    return NotFound(new { message = "Reading schedule not found" });

                return Ok(new { message = "Schedule marked as completed" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("user/{userId:int}/stats")]
        public async Task<ActionResult<ReadingScheduleStatsDTO>> GetReadingScheduleStats(int userId)
        {
            try
            {
                var stats = await _readingScheduleService.GetReadingScheduleStatsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
