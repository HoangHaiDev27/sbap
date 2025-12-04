using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReminderSettingsController : ControllerBase
    {
        private readonly IReminderSettingsService _reminderSettingsService;
        private readonly IMapper _mapper;

        public ReminderSettingsController(IReminderSettingsService reminderSettingsService, IMapper mapper)
        {
            _reminderSettingsService = reminderSettingsService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy cài đặt nhắc nhở của user hiện tại
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpGet("my-settings")]
        public async Task<IActionResult> GetMyReminderSettings()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var settings = await _reminderSettingsService.GetByUserIdAsync(userId);
                if (settings == null)
                {
                    return NotFound(new Response(-1, "Reminder settings not found", null));
                }

                return Ok(new Response(0, "Success", settings));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        /// <summary>
        /// Tạo hoặc cập nhật cài đặt nhắc nhở
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPost("my-settings")]
        public async Task<IActionResult> CreateOrUpdateMyReminderSettings([FromBody] CreateReminderSettingsDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new Response(-1, "Invalid data", ModelState));
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var settings = await _reminderSettingsService.CreateAsync(userId, createDto);
                return Ok(new Response(0, "Reminder settings saved successfully", settings));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        /// <summary>
        /// Cập nhật cài đặt nhắc nhở
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPut("my-settings")]
        public async Task<IActionResult> UpdateMyReminderSettings([FromBody] UpdateReminderSettingsDTO updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new Response(-1, "Invalid data", ModelState));
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var settings = await _reminderSettingsService.UpdateAsync(userId, updateDto);
                return Ok(new Response(0, "Reminder settings updated successfully", settings));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        /// <summary>
        /// Xóa cài đặt nhắc nhở
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpDelete("my-settings")]
        public async Task<IActionResult> DeleteMyReminderSettings()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized(new Response(-1, "User not authenticated", null));
                }

                var result = await _reminderSettingsService.DeleteAsync(userId);
                if (!result)
                {
                    return NotFound(new Response(-1, "Reminder settings not found", null));
                }

                return Ok(new Response(0, "Reminder settings deleted successfully", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        /// <summary>
        /// Lấy tất cả cài đặt nhắc nhở đang hoạt động (cho admin)
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpGet("all-active")]
        public async Task<IActionResult> GetAllActiveReminderSettings()
        {
            try
            {
                var settings = await _reminderSettingsService.GetAllActiveAsync();
                return Ok(new Response(0, "Success", settings));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }
    }
}
