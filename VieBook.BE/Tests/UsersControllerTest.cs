using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Collections.Generic;
using BusinessObject.Dtos;
using Xunit;

namespace Tests
{
    public class UsersControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public UsersControllerTest(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task PostUser_WithValidData_ReturnsCreatedAtAction()
        {
            var newUser = new UserDTO
            {
                Email = "test@example.com",
                Status = "Active",
                Wallet = 100
            };

            var response = await _client.PostAsJsonAsync("/api/Users", newUser);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }
        [Fact]
        public async Task PostUser_WithInvalidEmail_ReturnsBadRequest()
        {
            var newUser = new UserDTO
            {
                Email = "invalid-email",
                Status = "Active",
                Wallet = 100
            };

            var response = await _client.PostAsJsonAsync("/api/Users", newUser);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        [Fact]
        public async Task PostUser_WithNullEmail_ReturnsBadRequest()
        {
            var newUser = new UserDTO
            {
                Email = null,
                Status = "Active",
                Wallet = 100
            };

            var response = await _client.PostAsJsonAsync("/api/Users", newUser);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        [Fact]
        public async Task PostUser_WithEmptyEmail_ReturnsBadRequest()
        {
            var newUser = new UserDTO
            {
                Email = "",
                Status = "Active",
                Wallet = 100
            };

            var response = await _client.PostAsJsonAsync("/api/Users", newUser);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
        [Fact]
        public async Task GetUsers_ReturnsOk()
        {

            var response = await _client.GetAsync("/api/Users");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        [Fact]
        public async Task GetUser_WithValidId_ReturnsOk()
        {
            // Arrange: tạo user trước
            var newUser = new UserDTO
            {
                Email = "validid@example.com",
                Status = "Active",
                Wallet = 100
            };

            var createResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
            createResponse.EnsureSuccessStatusCode();
            var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDTO>();

            // Act
            var response = await _client.GetAsync($"/api/Users/{createdUser!.UserId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        [Fact]
        public async Task GetUser_WithInvalidId_ReturnsNotFound()
        {
            int invalidId = 9999;

            var response = await _client.GetAsync($"/api/Users/{invalidId}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetUserByEmail_WithValidEmail_ReturnsOk()
        {
            // Arrange: tạo user trước
            var newUser = new UserDTO
            {
                Email = "test@example.com",
                Status = "Active",
                Wallet = 100
            };

            await _client.PostAsJsonAsync("/api/Users", newUser);

            // Act
            var response = await _client.GetAsync($"/api/Users/email?email={newUser.Email}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        [Fact]
        public async Task GetUserByEmail_WithInvalidEmail_ReturnsNotFound()
        {
            var email = "nonexistent@example.com";

            var response = await _client.GetAsync($"/api/Users/email?email={email}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Deleteuser_WithValidId_ReturnsNoContent()
        {
            // Arrange: tạo user trước
            var newUser = new UserDTO
            {
                Email = "deleteuser@example.com",
                Status = "Active",
                Wallet = 100
            };

            var createResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
            createResponse.EnsureSuccessStatusCode();
            var createdUser = await createResponse.Content.ReadFromJsonAsync<UserDTO>();

            // Act
            var response = await _client.DeleteAsync($"/api/Users/{createdUser!.UserId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task Deleteuser_WithInvalidId_ReturnsNotFound()
        {
            var id = 99999; // An ID that doesn't exist

            var response = await _client.DeleteAsync($"/api/Users/{id}");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }


    }
}