using Services.Interfaces;
using System.Security.Claims;

namespace Services.Implementations
{
    public class PermissionService : IPermissionService
    {
        public bool HasRole(ClaimsPrincipal user, string role)
        {
            return user.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Any(c => c.Value.Equals(role, StringComparison.OrdinalIgnoreCase));
        }

        public bool HasAnyRole(ClaimsPrincipal user, params string[] roles)
        {
            var userRoles = GetUserRoles(user);
            return roles.Any(role => userRoles.Contains(role, StringComparer.OrdinalIgnoreCase));
        }

        public bool HasAllRoles(ClaimsPrincipal user, params string[] roles)
        {
            var userRoles = GetUserRoles(user);
            return roles.All(role => userRoles.Contains(role, StringComparer.OrdinalIgnoreCase));
        }

        public bool HasPermission(ClaimsPrincipal user, string permission)
        {
            return user.Claims
                .Where(c => c.Type == "permission")
                .Any(c => c.Value.Equals(permission, StringComparison.OrdinalIgnoreCase));
        }

        public bool HasAnyPermission(ClaimsPrincipal user, params string[] permissions)
        {
            var userPermissions = GetUserPermissions(user);
            return permissions.Any(permission => userPermissions.Contains(permission, StringComparer.OrdinalIgnoreCase));
        }

        public List<string> GetUserRoles(ClaimsPrincipal user)
        {
            return user.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();
        }

        public List<string> GetUserPermissions(ClaimsPrincipal user)
        {
            return user.Claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value)
                .ToList();
        }

        public bool IsOwner(ClaimsPrincipal user, string resourceUserId)
        {
            var currentUserId = GetUserId(user);
            return !string.IsNullOrEmpty(currentUserId) && 
                   !string.IsNullOrEmpty(resourceUserId) && 
                   currentUserId.Equals(resourceUserId, StringComparison.OrdinalIgnoreCase);
        }

        public string GetUserId(ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value
                ?? string.Empty;
        }
    }
}
