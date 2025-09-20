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
                var category = _mapper.Map<Category>(dto);
                await _categoryService.AddAsync(category);
                return CreatedAtAction(nameof(GetCategory),
                        new { id = category.CategoryId },
                        _mapper.Map<CategoryDTO>(category));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] PostCategory: {ex}");
                throw;
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, CategoryDTO dto)
        {
            if (id != dto.CategoryId) return BadRequest();
            var category = _mapper.Map<Category>(dto);
            await _categoryService.UpdateAsync(category);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null) return NotFound();
            await _categoryService.DeleteAsync(category);
            return NoContent();
        }
    }
}
