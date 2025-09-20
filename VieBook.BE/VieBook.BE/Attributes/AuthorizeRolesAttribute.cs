using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace VieBook.BE.Attributes
{
    /// <summary>
    /// Custom authorization attribute để kiểm tra roles cụ thể
    /// Sử dụng: [AuthorizeRoles("Admin", "Manager")]
    /// </summary>
    public class AuthorizeRolesAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string[] _allowedRoles;

        public AuthorizeRolesAttribute(params string[] roles)
        {
            _allowedRoles = roles ?? throw new ArgumentNullException(nameof(roles));
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Kiểm tra xem user đã đăng nhập chưa
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy roles từ claims
            var userRoles = context.HttpContext.User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            // Kiểm tra xem user có ít nhất một role được phép không
            var hasRequiredRole = _allowedRoles.Any(role => userRoles.Contains(role));

            if (!hasRequiredRole)
            {
                context.Result = new ForbidResult();
            }
        }
    }

    /// <summary>
    /// Custom authorization attribute để kiểm tra quyền cụ thể
    /// Sử dụng: [RequirePermission("BookManagement")]
    /// </summary>
    public class RequirePermissionAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _permission;

        public RequirePermissionAttribute(string permission)
        {
            _permission = permission ?? throw new ArgumentNullException(nameof(permission));
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Kiểm tra xem user đã đăng nhập chưa
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy permissions từ claims
            var userPermissions = context.HttpContext.User.Claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value)
                .ToList();

            // Kiểm tra xem user có permission được yêu cầu không
            if (!userPermissions.Contains(_permission))
            {
                context.Result = new ForbidResult();
            }
        }
    }

    /// <summary>
    /// Custom authorization attribute để kiểm tra quyền sở hữu resource
    /// Sử dụng: [AuthorizeOwner]
    /// </summary>
    public class AuthorizeOwnerAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Kiểm tra xem user đã đăng nhập chưa
            if (!context.HttpContext.User.Identity?.IsAuthenticated ?? true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy userId từ token
            var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? context.HttpContext.User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Lấy userId từ route parameters hoặc query string
            var resourceUserId = GetResourceUserIdFromContext(context);

            if (string.IsNullOrEmpty(resourceUserId))
            {
                context.Result = new BadRequestObjectResult(new { message = "Không tìm thấy thông tin resource" });
                return;
            }

            // Kiểm tra quyền sở hữu
            if (userIdClaim != resourceUserId)
            {
                context.Result = new ForbidResult();
            }
        }

        private string GetResourceUserIdFromContext(AuthorizationFilterContext context)
        {
            // Thử lấy từ route parameters
            if (context.RouteData.Values.TryGetValue("userId", out var userId))
            {
                return userId?.ToString();
            }

            // Thử lấy từ query string
            if (context.HttpContext.Request.Query.TryGetValue("userId", out var queryUserId))
            {
                return queryUserId.ToString();
            }

            // Thử lấy từ request body (cho POST/PUT requests)
            if (context.HttpContext.Request.Method == "POST" || context.HttpContext.Request.Method == "PUT")
            {
                // Cần implement logic để đọc request body
                // Tạm thời return null
                return null;
            }

            return null;
        }
    }
}

