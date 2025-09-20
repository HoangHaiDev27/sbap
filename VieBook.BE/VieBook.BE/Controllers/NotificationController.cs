using BusinessObject.Dtos;
using BusinessObject.PayOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Services.Interfaces;

namespace VieBook.BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/notification/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotification(long id)
        {
            try
            {
                var notification = await _notificationService.GetByIdAsync(id);
                if (notification == null)
                {
                    return NotFound(new Response(-1, "Notification not found", null));
                }

                return Ok(new Response(0, "Success", notification));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            try
            {
                var notifications = await _notificationService.GetByUserIdAsync(userId);
                return Ok(new Response(0, "Success", notifications));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/user/{userId}/unread
        [HttpGet("user/{userId}/unread")]
        public async Task<IActionResult> GetUnreadNotifications(int userId)
        {
            try
            {
                var notifications = await _notificationService.GetUnreadByUserIdAsync(userId);
                return Ok(new Response(0, "Success", notifications));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/user/{userId}/type/{type}
        [HttpGet("user/{userId}/type/{type}")]
        public async Task<IActionResult> GetNotificationsByType(int userId, string type)
        {
            try
            {
                var notifications = await _notificationService.GetByUserIdAndTypeAsync(userId, type);
                return Ok(new Response(0, "Success", notifications));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/user/{userId}/recent?count=10
        [HttpGet("user/{userId}/recent")]
        public async Task<IActionResult> GetRecentNotifications(int userId, [FromQuery] int count = 10)
        {
            try
            {
                var notifications = await _notificationService.GetRecentNotificationsAsync(userId, count);
                return Ok(new Response(0, "Success", notifications));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/user/{userId}/unread-count
        [HttpGet("user/{userId}/unread-count")]
        public async Task<IActionResult> GetUnreadCount(int userId)
        {
            try
            {
                var count = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(new Response(0, "Success", new { unreadCount = count }));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // POST: api/notification
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDTO createDto)
        {
            try
            {
                var notification = await _notificationService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationId },
                    new Response(0, "Notification created successfully", notification));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // PUT: api/notification/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotification(long id, [FromBody] UpdateNotificationDTO updateDto)
        {
            try
            {
                if (id != updateDto.NotificationId)
                {
                    return BadRequest(new Response(-1, "ID mismatch", null));
                }

                var notification = await _notificationService.UpdateAsync(updateDto);
                if (notification == null)
                {
                    return NotFound(new Response(-1, "Notification not found", null));
                }

                return Ok(new Response(0, "Notification updated successfully", notification));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // PUT: api/notification/{id}/mark-read
        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            try
            {
                var success = await _notificationService.MarkAsReadAsync(id);
                if (!success)
                {
                    return NotFound(new Response(-1, "Notification not found", null));
                }

                return Ok(new Response(0, "Notification marked as read", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // PUT: api/notification/user/{userId}/mark-all-read
        [HttpPut("user/{userId}/mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                var success = await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(new Response(0, "All notifications marked as read", new { success }));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // DELETE: api/notification/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(long id)
        {
            try
            {
                var success = await _notificationService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new Response(-1, "Notification not found", null));
                }

                return Ok(new Response(0, "Notification deleted successfully", null));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // POST: api/notification/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulkNotifications([FromBody] List<CreateNotificationDTO> createDtos)
        {
            try
            {
                var notifications = await _notificationService.CreateBulkNotificationsAsync(createDtos);
                return Ok(new Response(0, "Bulk notifications created successfully", notifications));
            }
            catch (Exception ex)
            {
                return BadRequest(new Response(-1, ex.Message, null));
            }
        }

        // GET: api/notification/types
        [HttpGet("types")]
        public IActionResult GetNotificationTypes()
        {
            var types = new
            {
                PAYMENT_SUCCESS = NotificationTypes.PAYMENT_SUCCESS,
                PAYMENT_FAILED = NotificationTypes.PAYMENT_FAILED,
                WALLET_RECHARGE = NotificationTypes.WALLET_RECHARGE,
                BOOK_PURCHASE = NotificationTypes.BOOK_PURCHASE,
                BOOK_APPROVAL = NotificationTypes.BOOK_APPROVAL,
                BOOK_REJECTED = NotificationTypes.BOOK_REJECTED,
                NEW_FOLLOWER = NotificationTypes.NEW_FOLLOWER,
                NEW_COMMENT = NotificationTypes.NEW_COMMENT,
                NEW_LIKE = NotificationTypes.NEW_LIKE,
                SYSTEM_ANNOUNCEMENT = NotificationTypes.SYSTEM_ANNOUNCEMENT,
                PROMOTION = NotificationTypes.PROMOTION
            };

            return Ok(new Response(0, "Success", types));
        }
    }
}
