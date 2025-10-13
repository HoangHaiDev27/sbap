using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces.Admin;

namespace VieBook.BE.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;
        private readonly IMapper _mapper;

        public StaffController(IStaffService staffService, IMapper mapper)
        {
            _staffService = staffService;
            _mapper = mapper;
        }

        // GET: api/staff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StaffDTO>>> GetAll()
        {
            var staffs = await _staffService.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<StaffDTO>>(staffs));
        }

        // GET: api/staff/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDTO>> GetById(int id)
        {
            var staff = await _staffService.GetByIdAsync(id);
            if (staff == null) return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });

            return Ok(_mapper.Map<StaffDTO>(staff));
        }

        // POST: api/staff
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] CreateStaffRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Request không hợp lệ" });

            try
            {
                var user = _mapper.Map<User>(request);
                await _staffService.AddAsync(user, request.Password);
                return CreatedAtAction(nameof(GetById), new { id = user.UserId }, new { message = "Staff tạo thành công và email đã gửi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/staff/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStaffRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Request không hợp lệ" });

            try
            {
                var user = _mapper.Map<User>(request);
                user.UserId = id;
                await _staffService.UpdateAsync(user, request.NewPassword);
                return Ok(new { message = "Cập nhật staff thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/staff/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _staffService.DeleteAsync(id);
                if (!success) return NotFound(new { message = $"Không tìm thấy staff với id = {id}" });
                return NoContent(); // 204
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Xóa nhân viên thất bại", error = ex.Message });
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
        [HttpPut("{id}/avatar")]
        public async Task<IActionResult> UpdateAvatar(int id, [FromForm] IFormFile avatarFile)
        {
            if (avatarFile == null || avatarFile.Length == 0)
                return BadRequest(new { message = "Chưa chọn file avatar" });

            try
            {
                var updatedStaff = await _staffService.UpdateAvatarAsync(id, avatarFile);
                return Ok(new
                {
                    message = "Cập nhật avatar thành công",
                    avatarUrl = updatedStaff.UserProfile?.AvatarUrl
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}/avatar")]
        public async Task<IActionResult> DeleteAvatar(int id)
        {
            try
            {
                var updatedStaff = await _staffService.DeleteAvatarAsync(id);
                return Ok(new 
                { 
                    message = "Xóa avatar thành công", 
                    avatarUrl = updatedStaff.UserProfile?.AvatarUrl 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
