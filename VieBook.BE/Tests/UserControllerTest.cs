using System.Net;
using System.Net.Http.Json;
using DTOs;
using BusinessObject;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using Xunit;
using System.Threading.Tasks;
namespace Tests
{
    public class UserControllerTest : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public UserControllerTest(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();

        }

        [Fact]
        public async Task GetUsers_ReturnsOk()
        {
            var response = await _client.GetAsync("/api/users");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task PostUser_CreatesUserSuccessfully()
        {
            // Arrange
            var newUser = new UserDTO
            {
                Email = "newuser3@test.com",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/users", newUser);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            var createdUser = await response.Content.ReadFromJsonAsync<UserDTO>();
            Assert.NotNull(createdUser);
            Assert.Equal(newUser.Email, createdUser.Email);
            Assert.Equal("Active", createdUser.Status);
            Assert.True(createdUser.UserId > 0);
        }
    }
}