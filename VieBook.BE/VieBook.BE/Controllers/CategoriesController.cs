using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using DataAccess.DAO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly IMapper _mapper;

        public CategoriesController(ICategoryService categoryService, IMapper mapper)
        {
            _categoryService = categoryService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<CategoryDTO>>(categories));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] GetCategories: {ex}");
                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDTO>> GetCategory(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null) return NotFound();
            return Ok(_mapper.Map<CategoryDTO>(category));
        }

        [HttpPost]
        public async Task<ActionResult<CategoryDTO>> PostCategory(CategoryDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { message = "Tên thể loại không được để trống" });
                }

                if (string.IsNullOrWhiteSpace(dto.Type))
                {
                    return BadRequest(new { message = "Loại thể loại không được để trống" });
                }

                // Kiểm tra tên category có trùng lặp không
                var nameExists = await _categoryService.IsNameExistsAsync(dto.Name);
                if (nameExists)
                {
                    return BadRequest(new { message = "Tên thể loại đã tồn tại" });
                }

                var category = _mapper.Map<Category>(dto);
                await _categoryService.AddAsync(category);
                return CreatedAtAction(nameof(GetCategory),
                        new { id = category.CategoryId },
                        _mapper.Map<CategoryDTO>(category));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] PostCategory: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi tạo thể loại");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, CategoryDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { message = "Tên thể loại không được để trống" });
                }

                if (string.IsNullOrWhiteSpace(dto.Type))
                {
                    return BadRequest(new { message = "Loại thể loại không được để trống" });
                }

                var existingCategory = await _categoryService.GetByIdAsync(id);
                if (existingCategory == null) return NotFound();

                // Kiểm tra tên category có trùng lặp không (loại trừ category hiện tại)
                var nameExists = await _categoryService.IsNameExistsAsync(dto.Name, id);
                if (nameExists)
                {
                    return BadRequest(new { message = "Tên thể loại đã tồn tại" });
                }

                // Cập nhật dữ liệu từ DTO vào entity hiện có
                existingCategory.Name = dto.Name;
                existingCategory.Type = dto.Type;
                existingCategory.IsActive = dto.IsActive;
                existingCategory.ParentId = dto.ParentId;

                await _categoryService.UpdateAsync(existingCategory);
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] PutCategory: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi cập nhật thể loại");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                // Kiểm tra xem category có sách nào không
                // Cần load Books để kiểm tra
                var category = await _categoryService.GetByIdWithBooksAsync(id);
                if (category == null) return NotFound();

                if (category.Books != null && category.Books.Any())
                {
                    // Nếu category đang được sử dụng, chuyển sang trạng thái không hoạt động
                    category.IsActive = false;
                    await _categoryService.UpdateAsync(category);
                    return Ok(new { message = $"Thể loại \"{category.Name}\" đang được sử dụng và đã chuyển sang trạng thái không hoạt động" });
                }

                // Nếu không có sách, xóa category
                await _categoryService.DeleteAsync(category);
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] DeleteCategory: {ex}");
                return StatusCode(500, "Có lỗi xảy ra khi xóa thể loại");
            }
        }
    }
}
