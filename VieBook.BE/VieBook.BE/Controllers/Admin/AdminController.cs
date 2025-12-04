using AutoMapper;
using BusinessObject.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Services.Interfaces.Admin;

namespace VieBook.BE.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _service;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudService;

        public AdminController(IAdminService service, IMapper mapper,ICloudinaryService cloudService)
        {
            _service = service;
            _mapper = mapper;
            _cloudService = cloudService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            try
            {
                var user = await _service.GetProfileAsync(id);
                var dto = _mapper.Map<AdminProfileDTO>(user);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Cập nhật hồ sơ + avatar
        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromForm] AdminProfileDTO dto, IFormFile? avatarFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _service.GetProfileAsync(id);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy admin." });

            try
            {
                // Nếu có file ảnh mới → upload + xóa ảnh cũ
                if (avatarFile != null)
                {
                    var newUrl = await _cloudService.UploadAvatarImageAsync(avatarFile, user.UserProfile?.AvatarUrl);
                    dto.AvatarUrl = newUrl; // Cập nhật vào DTO để service update
                }

                var updatedUser = await _service.UpdateProfileAsync(id, dto);
                var result = _mapper.Map<AdminProfileDTO>(updatedUser);

                return Ok(new { message = "Cập nhật thành công.", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            var result = await _service.GetStatisticsAsync(fromDate, toDate);
            return Ok(result);
        }
    }
}
