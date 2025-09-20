using System.Security.Claims;

namespace Services.Interfaces
{
    /// <summary>
    /// Service để kiểm tra permissions và roles
    /// </summary>
    public interface IPermissionService
    {
        /// <summary>
        /// Kiểm tra user có role cụ thể không
        /// </summary>
        bool HasRole(ClaimsPrincipal user, string role);

        /// <summary>
        /// Kiểm tra user có ít nhất một trong các roles không
        /// </summary>
        bool HasAnyRole(ClaimsPrincipal user, params string[] roles);

        /// <summary>
        /// Kiểm tra user có tất cả các roles không
        /// </summary>
        bool HasAllRoles(ClaimsPrincipal user, params string[] roles);

        /// <summary>
        /// Kiểm tra user có permission cụ thể không
        /// </summary>
        bool HasPermission(ClaimsPrincipal user, string permission);

        /// <summary>
        /// Kiểm tra user có ít nhất một trong các permissions không
        /// </summary>
        bool HasAnyPermission(ClaimsPrincipal user, params string[] permissions);

        /// <summary>
        /// Lấy danh sách roles của user
        /// </summary>
        List<string> GetUserRoles(ClaimsPrincipal user);

        /// <summary>
        /// Lấy danh sách permissions của user
        /// </summary>
        List<string> GetUserPermissions(ClaimsPrincipal user);

        /// <summary>
        /// Kiểm tra user có phải là owner của resource không
        /// </summary>
        bool IsOwner(ClaimsPrincipal user, string resourceUserId);

        /// <summary>
        /// Lấy userId từ claims
        /// </summary>
        string GetUserId(ClaimsPrincipal user);
    }
}

