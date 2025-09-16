using BusinessObject;
using DataAccess;
using BusinessObject.Dtos;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;
using Repositories.Implementations;
using Services.Interfaces;
using Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
if (builder.Environment.EnvironmentName == "Testing")
{
    builder.Services.AddDbContext<VieBookContext>(options =>
        options.UseInMemoryDatabase("TestDb"));
}
else
{
    builder.Services.AddDbContext<VieBookContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

//Add DAO
builder.Services.AddScoped<UserDAO>();


//Add Repo
builder.Services.AddScoped<IUserRepository, UserRepository>();

//Add Service
builder.Services.AddScoped<IUserService, UserService>();

//Add automapper
builder.Services.AddAutoMapper(typeof(MappingDTO));

builder.Services.AddControllers();
//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3008") // 👈 Thay URL frontend tại đây
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
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
