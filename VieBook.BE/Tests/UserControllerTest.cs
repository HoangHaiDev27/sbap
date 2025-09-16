using System.Net;
using System.Net.Http.Json;
using BusinessObject.Dtos;
using Xunit;

namespace Tests
{
    public class UserControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public UserControllerTest(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetUsers_ReturnsOk()
        {
            // Act
            var response = await _client.GetAsync("/api/users");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task PostUser_CreatesUserSuccessfully()
        {
            // Arrange
            var newUser = new UserDTO
            {
                Email = "newuser@test.com",
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

        [Fact]
        public async Task GetUsers_ReturnsCreatedUser()
        {
            // Arrange
            var newUser = new UserDTO
            {
                Email = "getuser@test.com",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            var createResponse = await _client.PostAsJsonAsync("/api/users", newUser);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDTO>();
            Assert.NotNull(createdUser);

            // Act
            var getResponse = await _client.GetAsync("/api/users");
            getResponse.EnsureSuccessStatusCode();

            var users = await getResponse.Content.ReadFromJsonAsync<List<UserDTO>>();

            // Assert
            Assert.NotNull(users);
            Assert.Contains(users, u => u.Email == newUser.Email);
        }
    }
}
