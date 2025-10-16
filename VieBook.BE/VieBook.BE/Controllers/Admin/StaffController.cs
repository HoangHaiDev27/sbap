using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Services.Interfaces.Admin;

namespace VieBook.BE.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudService;

        public StaffController(IStaffService staffService, IMapper mapper, ICloudinaryService cloudService)
        {
            _staffService = staffService;
            _mapper = mapper;
            _cloudService = cloudService;
        }

        // Lấy toàn bộ staff
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var staffs = await _staffService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<StaffDTO>>(staffs));
        }

        // Lấy staff theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var staff = await _staffService.GetByIdAsync(id);
            if (staff == null)
                return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });

            return Ok(_mapper.Map<StaffDTO>(staff));
        }

        // Thêm mới staff (có thể kèm avatar)
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromForm] CreateStaffRequestDTO request, IFormFile? avatarFile)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // B1: tạo staff cơ bản
                var user = _mapper.Map<User>(request);
                var createdStaff = await _staffService.AddAsync(user, request.Password);

                // B2: nếu có file avatar thì upload lên Cloudinary
                if (avatarFile != null)
                {
                    var newUrl = await _cloudService.UploadAvatarImageAsync(avatarFile, null);
                    await _staffService.UpdateAvatarUrlAsync(createdStaff.UserId, newUrl);
                }

                return Ok(new { message = "Thêm nhân viên mới thành công", data = createdStaff });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cập nhật thông tin Staff + avatar
      [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdateStaff(int id, [FromForm] UpdateStaffRequestDTO dto, IFormFile? avatarFile)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var staff = await _staffService.GetByIdAsync(id);
        if (staff == null)
            return NotFound(new { message = "Staff không tồn tại." });

        try
        {
            if (avatarFile != null)
            {
                var newUrl = await _cloudService.UploadAvatarImageAsync(avatarFile, staff.UserProfile?.AvatarUrl);
                dto.AvatarUrl = newUrl;
            }

            // Gọi service update
        var userToUpdate = _mapper.Map<User>(dto);
            userToUpdate.UserId = id;

            var updatedStaff = await _staffService.UpdateAsync(userToUpdate, dto.NewPassword);

            var result = _mapper.Map<StaffDTO>(updatedStaff);
            return Ok(new { message = "Cập nhật staff thành công.", data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
        // Cập nhật avatar riêng (khi chỉ đổi ảnh)
        [HttpPut("{id}/avatar")]
        public async Task<IActionResult> UpdateAvatar(int id, [FromForm] IFormFile avatarFile)
        {
            if (avatarFile == null || avatarFile.Length == 0)
                return BadRequest(new { message = "Chưa chọn file avatar." });

            var staff = await _staffService.GetByIdAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy staff." });

            try
            {
                var newUrl = await _cloudService.UploadAvatarImageAsync(avatarFile, staff.UserProfile?.AvatarUrl);
                await _staffService.UpdateAvatarUrlAsync(id, newUrl);

                return Ok(new
                {
                    message = "Cập nhật avatar thành công",
                    avatarUrl = newUrl
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // PATCH: api/staff/lock/{id}
        [HttpPatch("lock/{id}")]
        public async Task<IActionResult> Lock(int id)
        {
            try
            {
                var success = await _staffService.LockStaffAsync(id);
                if (!success) return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Khóa nhân viên thất bại", error = ex.Message });
            }
        }

        // PATCH: api/staff/unlock/{id}
        [HttpPatch("unlock/{id}")]
        public async Task<IActionResult> Unlock(int id)
        {
            try
            {
                var success = await _staffService.UnlockStaffAsync(id);
                if (!success) return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Mở khóa nhân viên thất bại", error = ex.Message });
            }
        }

        // PATCH: api/staff/toggle-status/{id}
        [HttpPatch("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var success = await _staffService.ToggleStaffStatusAsync(id);
                if (!success) return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đổi trạng thái thất bại", error = ex.Message });
            }
        }

    }
}
