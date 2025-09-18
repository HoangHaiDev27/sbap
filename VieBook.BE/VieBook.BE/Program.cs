using BusinessObject;
using DataAccess;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using Repositories.Implementations;
using Services.Interfaces;
using Services.Implementations;
using Net.payOS;
using DataAccess.DAO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DataAccess.DAO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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

builder.Services.AddAuthorization();


//Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();
//Add DAO
builder.Services.AddScoped<UserDAO>();
builder.Services.AddScoped<AuthenDAO>();
builder.Services.AddScoped<PasswordResetTokenDAO>();
builder.Services.AddScoped<AuthenDAO>();
builder.Services.AddScoped<PasswordResetTokenDAO>();

//Add Repo
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWalletTransactionRepository, WalletTransactionRepository>();
builder.Services.AddScoped<IAuthenRepository, AuthenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
builder.Services.AddScoped<IAuthenRepository, AuthenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

//Add Service
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IWalletTransactionService, WalletTransactionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();


//Add automapper
builder.Services.AddAutoMapper(typeof(MappingDTO));

builder.Services.AddControllers();
//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(ApiConfiguration.Cors.POLICY_NAME,
        policy =>
        {
            policy.WithOrigins(ApiConfiguration.Cors.ALLOWED_ORIGINS)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials() // Nếu cần gửi cookie/token
                  .SetIsOriginAllowedToAllowWildcardSubdomains(); // Cho phép subdomain
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
app.UseCors(ApiConfiguration.Cors.POLICY_NAME);
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
