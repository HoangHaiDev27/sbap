using AutoMapper;
using BusinessObject.Dtos;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.Security.Claims;
using VieBook.BE.Attributes;
using VieBook.BE.Constants;

namespace VieBook.BE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IMapper _mapper;

        public TransactionController(ITransactionService transactionService, IMapper mapper)
        {
            _transactionService = transactionService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách giao dịch với bộ lọc và phân trang
        /// </summary>
        [HttpGet]
        [RequirePermission(Permissions.ViewTransactions)]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? typeFilter = "all",
            [FromQuery] string? statusFilter = "all",
            [FromQuery] string? dateFilter = "all",
            [FromQuery] int? userId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _transactionService.GetTransactionsAsync(
                    searchTerm, typeFilter, statusFilter, dateFilter, userId, page, pageSize);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách giao dịch", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thống kê giao dịch
        /// </summary>
        [HttpGet("stats")]
        [RequirePermission(Permissions.ViewTransactions)]
        public async Task<IActionResult> GetTransactionStats(
            [FromQuery] string? typeFilter = "all",
            [FromQuery] string? statusFilter = "all",
            [FromQuery] string? dateFilter = "all",
            [FromQuery] int? userId = null)
        {
            try
            {
                var stats = await _transactionService.GetTransactionStatsAsync(
                    typeFilter, statusFilter, dateFilter, userId);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thống kê giao dịch", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết giao dịch theo ID
        /// </summary>
        [HttpGet("{transactionId}")]
        [RequirePermission(Permissions.ViewTransactions)]
        public async Task<IActionResult> GetTransactionDetail(string transactionId)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionDetailAsync(transactionId);
                if (transaction == null)
                {
                    return NotFound(new { message = "Không tìm thấy giao dịch" });
                }

                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết giao dịch", error = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật trạng thái giao dịch (chỉ dành cho staff/admin)
        /// </summary>
        [HttpPut("{transactionId}/status")]
        [RequirePermission(Permissions.ManageTransactions)]
        public async Task<IActionResult> UpdateTransactionStatus(
            string transactionId, 
            [FromBody] UpdateTransactionStatusRequest request)
        {
            try
            {
                var result = await _transactionService.UpdateTransactionStatusAsync(transactionId, request.Status, request.Notes);
                if (!result)
                {
                    return BadRequest(new { message = "Không thể cập nhật trạng thái giao dịch" });
                }

                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái giao dịch", error = ex.Message });
            }
        }

        [HttpGet("debug/permissions")]
        [Authorize]
        public IActionResult GetUserPermissions()
        {
            try
            {
                var userPermissions = User.Claims
                    .Where(c => c.Type == "permission")
                    .Select(c => c.Value)
                    .ToList();

                var userRoles = User.Claims
                    .Where(c => c.Type == ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList();

                return Ok(new
                {
                    userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    email = User.FindFirst(ClaimTypes.Email)?.Value,
                    roles = userRoles,
                    permissions = userPermissions,
                    hasViewTransactions = userPermissions.Contains(Permissions.ViewTransactions),
                    hasManageTransactions = userPermissions.Contains(Permissions.ManageTransactions)
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class UpdateTransactionStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
