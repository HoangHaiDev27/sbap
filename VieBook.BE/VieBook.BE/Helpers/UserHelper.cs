using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace VieBook.BE.Helpers
{
    public static class UserHelper
    {
        public static int? GetCurrentUserId(HttpContext httpContext)
        {
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return null;

            // Check for test authentication first
            var testUserIdClaim = httpContext.User.FindFirst("UserId")?.Value;
            if (!string.IsNullOrEmpty(testUserIdClaim) && int.TryParse(testUserIdClaim, out int testUserId))
                return testUserId;

            var userIdClaim = httpContext.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value
                ?? httpContext.User.FindFirst("sub")?.Value
                ?? httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return null;

            return userId;
        }

        public static string? GetCurrentUserEmail(HttpContext httpContext)
        {
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return null;

            return httpContext.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value
                ?? httpContext.User.FindFirst(ClaimTypes.Email)?.Value;
        }
    }
}
