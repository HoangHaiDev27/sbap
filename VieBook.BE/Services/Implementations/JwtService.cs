using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(string userId, string email, List<string>? roles = null)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Add roles to claims
        if (roles != null && roles.Any())
        {
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add permissions based on roles
            var permissions = GetPermissionsForRoles(roles);
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["ExpireMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }

    private List<string> GetPermissionsForRoles(List<string> roles)
    {
        var allPermissions = new List<string>();
        
        foreach (var role in roles)
        {
            switch (role)
            {
                case "Admin":
                    allPermissions.AddRange(new[]
                    {
                        "UserManagement", "ViewUsers", "CreateUsers", "UpdateUsers", "DeleteUsers",
                        "BookManagement", "ViewBooks", "CreateBooks", "UpdateBooks", "DeleteBooks", "ApproveBooks",
                        "OrderManagement", "ViewOrders", "CreateOrders", "UpdateOrders", "CancelOrders",
                        "PaymentManagement", "ViewPayments", "ProcessPayments", "RefundPayments",
                        "CategoryManagement", "ViewCategories", "CreateCategories", "UpdateCategories", "DeleteCategories",
                        "NotificationManagement", "ViewNotifications", "SendNotifications",
                        "Analytics", "ViewReports", "ExportData",
                        "SystemSettings", "ManageRoles", "ManagePermissions"
                    });
                    break;
                case "Owner":
                    allPermissions.AddRange(new[]
                    {
                        "UserManagement", "ViewUsers", "CreateUsers", "UpdateUsers",
                        "BookManagement", "ViewBooks", "CreateBooks", "UpdateBooks", "ApproveBooks",
                        "OrderManagement", "ViewOrders", "UpdateOrders",
                        "PaymentManagement", "ViewPayments", "ProcessPayments",
                        "CategoryManagement", "ViewCategories", "CreateCategories", "UpdateCategories",
                        "NotificationManagement", "ViewNotifications", "SendNotifications",
                        "Analytics", "ViewReports", "ExportData"
                    });
                    break;
                case "Staff":
                    allPermissions.AddRange(new[]
                    {
                        "UserManagement", "ViewUsers", "CreateUsers", "UpdateUsers",
                        "BookManagement", "ViewBooks", "CreateBooks", "UpdateBooks", "ApproveBooks",
                        "OrderManagement", "ViewOrders", "UpdateOrders",
                        "PaymentManagement", "ViewPayments", "ProcessPayments",
                        "CategoryManagement", "ViewCategories", "CreateCategories", "UpdateCategories",
                        "NotificationManagement", "ViewNotifications", "SendNotifications",
                        "Analytics", "ViewReports"
                    });
                    break;
                case "Customer":
                    allPermissions.AddRange(new[]
                    {
                        "ViewBooks", "ViewOrders", "CreateOrders", "ViewPayments", "ViewCategories", "ViewNotifications"
                    });
                    break;
            }
        }
        
        return allPermissions.Distinct().ToList();
    }
}
