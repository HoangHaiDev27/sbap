using BusinessObject;
using BusinessObject.Dtos;
using DataAccess;
using DataAccess.DAO;
using DataAccess.DAO.Admin;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Net.payOS;
using Repositories.Implementations;
using Repositories.Implementations.Admin;
using Repositories.Implementations.DataAccess.Repository;
using Repositories.Implementations.Staff;
using Repositories.Interfaces;
using Repositories.Interfaces.Admin;
using Repositories.Interfaces.Staff;
using Services.Implementations;
using Services.Implementations.Admin;
using Services.Implementations.Staff;
using Services.Interfaces;
using Services.Interfaces.Admin;
using Services.Interfaces.Staff;
using System.Text;
using VieBook.BE.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
if (builder.Environment.EnvironmentName == "Testing")
{
    builder.Services.AddDbContext<VieBookContext>(options =>
        options.UseInMemoryDatabase(ApiConfiguration.Database.TEST_DATABASE_NAME));
}
else
{
    builder.Services.AddDbContext<VieBookContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString(ApiConfiguration.Database.CONNECTION_STRING_KEY)));
}
IConfiguration configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

PayOS payOS = new PayOS(configuration[ApiConfiguration.PayOS.CLIENT_ID_KEY] ?? throw new Exception("Cannot find PayOS_CLIENT_ID"),
                    configuration[ApiConfiguration.PayOS.API_KEY] ?? throw new Exception("Cannot find PAYOS_API_KEY"),
                    configuration[ApiConfiguration.PayOS.CHECKSUM_KEY] ?? throw new Exception("Cannot find PAYOS_CHECKSUM_KEY"));
//Add PayOS
builder.Services.AddSingleton(payOS);
// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]))
    };
});
// CORS policy registration (single source of truth)
builder.Services.AddAuthorization();


//Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

//Add HttpClient
builder.Services.AddHttpClient();
//Add DAO
builder.Services.AddScoped<UserDAO>();
builder.Services.AddScoped<AuthenDAO>();
builder.Services.AddScoped<PasswordResetTokenDAO>();
builder.Services.AddScoped<RefreshTokenDAO>();
builder.Services.AddScoped<BookDao>();
builder.Services.AddScoped<CategoryDAO>();
builder.Services.AddScoped<PromotionDAO>();
builder.Services.AddScoped<StaffDAO>();
builder.Services.AddScoped<AdminDAO>();
builder.Services.AddScoped<ChapterDAO>();
builder.Services.AddScoped<WishlistDAO>();



//Add Repo
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IAuthenRepository, AuthenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IBookApprovalRepository, BookApprovalRepository>();
builder.Services.AddScoped<IChapterRepository, ChapterRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();

//Add Service
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWalletTransactionService, WalletTransactionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IChapterPurchaseService, ChapterPurchaseService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IBookApprovalService, BookApprovalService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();


// Cloudinaary service
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<CloudinaryService>();


//Add automapper
builder.Services.AddAutoMapper(typeof(MappingDTO));
builder.Services.AddSingleton<JwtService>();

// Add Google Authentication (for server-side verification only)
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["GoogleAuth:ClientId"] ?? throw new Exception("Google ClientId not found");
        options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"] ?? throw new Exception("Google ClientSecret not found");
    });

builder.Services.AddControllers();
//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(ApiConfiguration.Cors.POLICY_NAME, policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed(origin => true);
        }
        else
        {
            policy
                .WithOrigins(ApiConfiguration.Cors.ALLOWED_ORIGINS)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .SetIsOriginAllowedToAllowWildcardSubdomains();
        }
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// Apply CORS early
app.UseCors(ApiConfiguration.Cors.POLICY_NAME);
// Only force HTTPS in non-development to avoid local 307 redirects
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
