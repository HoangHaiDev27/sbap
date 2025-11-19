using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace VieBookAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner")]
    public class PromotionsController : ControllerBase
    {
        private readonly IPromotionService _promotionService;

        public PromotionsController(IPromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        [HttpGet("owner/{ownerId}/stats")]
        public async Task<IActionResult> GetStatsByOwner(int ownerId)
        {
            var stats = await _promotionService.GetStatsByOwnerAsync(ownerId);
            return Ok(stats);
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetPromotionsByOwner(int ownerId)
        {
            var promotions = await _promotionService.GetPromotionsByOwnerAsync(ownerId);
            if (promotions == null || !promotions.Any())
                return NotFound(new { message = "Không tìm thấy promotion nào." });

            // Map entity -> DTO
            var result = promotions.Select(p =>
            {
                var dto = new PromotionDTO
                {
                    PromotionId = p.PromotionId,
                    OwnerId = p.OwnerId,
                    PromotionName = p.PromotionName,
                    Description = p.Description,
                    DiscountType = p.DiscountType,
                    DiscountValue = p.DiscountValue,
                    StartAt = p.StartAt,
                    EndAt = p.EndAt,
                    IsActive = p.IsActive,
                };

                dto.Books = p.Books.Select(b => new BookWithPromotionDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    Description = b.Description,
                    CoverUrl = b.CoverUrl,
                    Isbn = b.Isbn,
                    Language = b.Language,
                    TotalView = b.TotalView,
                    CreatedAt = b.CreatedAt,
                    Author = b.Author,
                    OwnerId = b.OwnerId,
                    Status = b.Status,
                    TotalPrice = b.Chapters
                                  .Where(c => c.Status == "Active")
                                  .Sum(c => (c.PriceSoft ?? 0) + 
                                            (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                : 0)),
                    DiscountedPrice = b.Chapters
                                       .Where(c => c.Status == "Active")
                                       .Sum(c => (c.PriceSoft ?? 0) + 
                                                 (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                     ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                     : 0)) *
                        (1 - (p.DiscountType == "Percent" ? (p.DiscountValue / 100) : 0)),
                    Sold = 0,
                    Rating = 0,
                    OwnerName = b.Owner?.UserProfile?.FullName,
                    CategoryIds = b.Categories?.Select(c => c.CategoryId).ToList() ?? new List<int>()
                }).ToList();

                dto.BookCount = dto.Books.Count;
                dto.Status = DateTime.UtcNow < dto.StartAt ? "Upcoming" :
                             DateTime.UtcNow > dto.EndAt ? "Expired" : "Active";
                return dto;
            });

            return Ok(result);
        }

        [HttpGet("owner/{ownerId}/inactive")]
        public async Task<IActionResult> GetInactivePromotionsByOwner(int ownerId)
        {
            var promotions = await _promotionService.GetInactivePromotionsByOwnerAsync(ownerId);
            if (promotions == null || !promotions.Any())
                return Ok(new List<PromotionDTO>()); // Trả về mảng rỗng thay vì NotFound

            // Map entity -> DTO (giống như GetPromotionsByOwner)
            var result = promotions.Select(p =>
            {
                var dto = new PromotionDTO
                {
                    PromotionId = p.PromotionId,
                    OwnerId = p.OwnerId,
                    PromotionName = p.PromotionName,
                    Description = p.Description,
                    DiscountType = p.DiscountType,
                    DiscountValue = p.DiscountValue,
                    StartAt = p.StartAt,
                    EndAt = p.EndAt,
                    IsActive = p.IsActive,
                };

                dto.Books = p.Books.Select(b => new BookWithPromotionDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    Description = b.Description,
                    CoverUrl = b.CoverUrl,
                    Isbn = b.Isbn,
                    Language = b.Language,
                    TotalView = b.TotalView,
                    CreatedAt = b.CreatedAt,
                    Author = b.Author,
                    OwnerId = b.OwnerId,
                    Status = b.Status,
                    TotalPrice = b.Chapters
                                  .Where(c => c.Status == "Active")
                                  .Sum(c => (c.PriceSoft ?? 0) + 
                                            (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                : 0)),
                    DiscountedPrice = b.Chapters
                                       .Where(c => c.Status == "Active")
                                       .Sum(c => (c.PriceSoft ?? 0) + 
                                                 (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                     ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                     : 0)) *
                        (1 - (p.DiscountType == "Percent" ? (p.DiscountValue / 100) : 0)),
                    Sold = 0,
                    Rating = 0,
                    OwnerName = b.Owner?.UserProfile?.FullName,
                    CategoryIds = b.Categories?.Select(c => c.CategoryId).ToList() ?? new List<int>()
                }).ToList();

                dto.BookCount = dto.Books.Count;
                dto.Status = DateTime.UtcNow < dto.StartAt ? "Upcoming" :
                             DateTime.UtcNow > dto.EndAt ? "Expired" : "Active";
                return dto;
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePromotion([FromBody] PromotionCreateDTO dto)
        {
            if (dto == null || dto.BookIds == null || !dto.BookIds.Any())
                return BadRequest(new { message = "Promotion phải áp dụng ít nhất 1 sách." });

            if (dto.DiscountPercent <= 0 || dto.DiscountPercent > 100)
                return BadRequest(new { message = "Giá trị giảm phải nằm trong khoảng 1% - 100%." });

            // Frontend đã gửi ISO UTC string, chỉ cần đảm bảo Kind là UTC
            var startUtc = DateTime.SpecifyKind(dto.StartAt, DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(dto.EndAt, DateTimeKind.Utc);

            var promotion = new Promotion
            {
                OwnerId = dto.OwnerId,
                PromotionName = dto.PromotionName,
                Description = dto.Description,
                DiscountType = "Percent",
                DiscountValue = dto.DiscountPercent,
                StartAt = startUtc,
                EndAt = endUtc,
                IsActive = true
            };

            try
            {
                var created = await _promotionService.CreatePromotionAsync(promotion, dto.BookIds);

                var result = new PromotionDTO
                {
                    PromotionId = created.PromotionId,
                    OwnerId = created.OwnerId,
                    PromotionName = created.PromotionName,
                    Description = created.Description,
                    DiscountType = created.DiscountType,
                    DiscountValue = created.DiscountValue,
                    StartAt = created.StartAt,
                    EndAt = created.EndAt,
                    IsActive = created.IsActive,
                };

                result.Books = created.Books.Select(b => new BookWithPromotionDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                }).ToList();
                result.BookCount = result.Books.Count;
                result.Status = DateTime.UtcNow < result.StartAt ? "Upcoming" :
                                 DateTime.UtcNow > result.EndAt ? "Expired" : "Active";

                return CreatedAtAction(nameof(GetPromotionsByOwner),
                    new { ownerId = result.OwnerId },
                    result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{promotionId}")]
        public async Task<IActionResult> UpdatePromotion(int promotionId, [FromBody] PromotionCreateDTO dto)
        {
            if (dto == null || dto.BookIds == null || !dto.BookIds.Any())
                return BadRequest(new { message = "Promotion phải áp dụng ít nhất 1 sách." });

            if (dto.DiscountPercent <= 0 || dto.DiscountPercent > 100)
                return BadRequest(new { message = "Giá trị giảm phải nằm trong khoảng 1% - 100%." });

            var existing = await _promotionService.GetPromotionByIdAsync(promotionId);
            if (existing == null)
                return NotFound(new { message = "Promotion không tồn tại." });

            // Chỉ cho phép update promotion đang active
            if (!existing.IsActive)
                return BadRequest(new { message = "Không thể chỉnh sửa promotion đã vô hiệu hóa." });

            existing.PromotionName = dto.PromotionName;
            existing.Description = dto.Description;
            existing.DiscountType = "Percent";
            existing.DiscountValue = dto.DiscountPercent;
            // Frontend đã gửi ISO UTC string, chỉ cần đảm bảo Kind là UTC
            existing.StartAt = DateTime.SpecifyKind(dto.StartAt, DateTimeKind.Utc);
            existing.EndAt = DateTime.SpecifyKind(dto.EndAt, DateTimeKind.Utc);

            try
            {
                var updated = await _promotionService.UpdatePromotionAsync(existing, dto.BookIds);

                var result = new PromotionDTO
                {
                    PromotionId = updated.PromotionId,
                    OwnerId = updated.OwnerId,
                    PromotionName = updated.PromotionName,
                    Description = updated.Description,
                    DiscountType = updated.DiscountType,
                    DiscountValue = updated.DiscountValue,
                    StartAt = updated.StartAt,
                    EndAt = updated.EndAt,
                    IsActive = updated.IsActive,
                };

                result.Books = updated.Books.Select(b => new BookWithPromotionDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    Description = b.Description,
                    CoverUrl = b.CoverUrl,
                    TotalPrice = b.Chapters
                                  .Where(c => c.Status == "Active")
                                  .Sum(c => (c.PriceSoft ?? 0) + 
                                            (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                : 0)),
                    DiscountedPrice = b.Chapters
                                       .Where(c => c.Status == "Active")
                                       .Sum(c => (c.PriceSoft ?? 0) + 
                                                 (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                     ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                     : 0)) *
                                      (1 - (updated.DiscountType == "Percent" ? (updated.DiscountValue / 100) : 0)),
                }).ToList();

                result.BookCount = result.Books.Count;
                result.Status = DateTime.UtcNow < result.StartAt ? "Upcoming" :
                                 DateTime.UtcNow > result.EndAt ? "Expired" : "Active";

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("{promotionId}")]
        public async Task<IActionResult> GetPromotionDetail(int promotionId)
        {
            var promotion = await _promotionService.GetPromotionByIdAsync(promotionId);
            if (promotion == null) return NotFound(new { message = "Promotion không tồn tại." });

            var result = new PromotionWithBookDTO
            {
                PromotionId = promotion.PromotionId,
                OwnerId = promotion.OwnerId,
                PromotionName = promotion.PromotionName,
                Description = promotion.Description,
                DiscountValue = promotion.DiscountValue,
                StartAt = promotion.StartAt,
                EndAt = promotion.EndAt,
                IsActive = promotion.IsActive,
                Books = promotion.Books.Select(b => new BookWithPromotionDTO
                {
                    BookId = b.BookId,
                    Title = b.Title,
                    Description = b.Description,
                    CoverUrl = b.CoverUrl,
                    TotalPrice = b.Chapters
                                  .Where(c => c.Status == "Active")
                                  .Sum(c => (c.PriceSoft ?? 0) + 
                                            (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                : 0)),
                    DiscountedPrice = b.Chapters
                                       .Where(c => c.Status == "Active")
                                       .Sum(c => (c.PriceSoft ?? 0) + 
                                                 (c.ChapterAudios != null && c.ChapterAudios.Any() 
                                                     ? c.ChapterAudios.OrderByDescending(ca => ca.CreatedAt).FirstOrDefault()!.PriceAudio ?? 0 
                                                     : 0)) *
                                      (1 - (promotion.DiscountType == "Percent" ? (promotion.DiscountValue / 100) : 0)),
                }).ToList()
            };

            return Ok(result);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromotion(int id, [FromQuery] int ownerId)
        {
            var result = await _promotionService.DeletePromotionAsync(id, ownerId);

            if (!result)
                return NotFound(new { message = "Promotion không tồn tại hoặc không thuộc quyền sở hữu" });

            return Ok(new { message = "Promotion đã được vô hiệu hoá (soft delete)" });
        }

    }
}
