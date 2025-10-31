using BusinessObject;
using BusinessObject.Chatbase;
using BusinessObject.Dtos;
using BusinessObject.OpenAI;
using DataAccess;
using DataAccess.DAO;
using DataAccess.DAO.Admin;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Net.payOS;
using Repositories.Implementations;
using Repositories.Implementations.Admin;
using Repositories.Implementations.DataAccess.Repository;
using Repositories.Implementations.Staff;
using Repositories.Interfaces;
using Repositories.Interfaces.Admin;
using Repositories.Interfaces.Staff;
using Service.Implementations;
using Service.Interfaces;
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

// Add logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);
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
builder.Services.AddScoped<ChapterAudioDAO>();
builder.Services.AddScoped<RankingSummaryDAO>();
builder.Services.AddScoped<WishlistDAO>();
builder.Services.AddScoped<BookReviewDAO>();
builder.Services.AddScoped<OrderItemDAO>();
builder.Services.AddScoped<UserFeedbackDAO>();
builder.Services.AddScoped<ReadingHistoryDAO>();
builder.Services.AddScoped<BookmarkDAO>();
builder.Services.AddScoped<NotificationDAO>();
builder.Services.AddScoped<ReadingScheduleDAO>();
builder.Services.AddScoped<ReminderSettingsDAO>();
builder.Services.AddScoped<WalletTransactionDAO>();
builder.Services.AddScoped<ReadingStatsDAO>();
builder.Services.AddScoped<SubscriptionDAO>();
builder.Services.AddScoped<ChatbaseDAO>();
builder.Services.AddScoped<TransactionDAO>();



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
builder.Services.AddScoped<IChapterAudioRepository, ChapterAudioRepository>();
builder.Services.AddScoped<IRankingRepository, RankingRepository>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IBookReviewRepository, BookReviewRepository>();
builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
builder.Services.AddScoped<IUserFeedbackRepository, UserFeedbackRepository>();
builder.Services.AddScoped<IReadingHistoryRepository, ReadingHistoryRepository>();
builder.Services.AddScoped<IReadingStatsRepository, ReadingStatsRepository>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<IChatbaseRepository, ChatbaseRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IOwnerDashboardRepository, OwnerDashboardRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();

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
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPromotionService, PromotionService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IBookApprovalService, BookApprovalService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<IChapterAudioService, ChapterAudioService>();
builder.Services.AddScoped<IRankingService, RankingService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IBookReviewService, BookReviewService>();
builder.Services.AddScoped<IOrderItemService, OrderItemService>();
builder.Services.AddScoped<IUserFeedbackService, UserFeedbackService>();
builder.Services.AddScoped<IReadingScheduleRepository, ReadingScheduleRepository>();
builder.Services.AddScoped<IReadingScheduleService, ReadingScheduleService>();
builder.Services.AddScoped<IReadingHistoryService, ReadingHistoryService>();
builder.Services.AddScoped<IReadingStatsService, ReadingStatsService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IReminderSettingsRepository, ReminderSettingsRepository>();
builder.Services.AddScoped<IReminderSettingsService, ReminderSettingsService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IOwnerDashboardService, OwnerDashboardService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddHostedService<Services.BackgroundServices.ReminderBackgroundService>();
builder.Services.AddHttpClient<IChatbaseService, ChatbaseService>();
builder.Services.AddHttpClient<ChatbaseService>();


//Add OpenAI service
builder.Services.AddScoped<DataAccess.DAO.OpenAIDAO>();
builder.Services.AddScoped<IOpenAIRepository, OpenAIRepository>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();

//Add Bookmark service
builder.Services.AddScoped<IBookmarkRepository, BookmarkRepository>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();


// Cloudinaary service
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<CloudinaryService>();
//FPT AI service
builder.Services.AddScoped<IAudioService, AudioService>();
//OpenAI service
builder.Services.Configure<OpenAIConfig>(builder.Configuration.GetSection("OpenAI"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<OpenAIConfig>>().Value);
//Chatbase service
builder.Services.Configure<ChatbaseConfig>(builder.Configuration.GetSection("Chatbase"));


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

// Add SignalR
builder.Services.AddSignalR();

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
                .AllowCredentials()
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

// Add debug logging
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("🚀 Application starting up...");
logger.LogInformation("🔧 Background services registered: {count}", 
    app.Services.GetServices<IHostedService>().Count());

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

// Map SignalR Hub
app.MapHub<VieBook.BE.Hubs.ChatHub>("/chathub");

app.Run();

public partial class Program { }
