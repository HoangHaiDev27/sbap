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
        int validId = 1;

        var response = await _client.GetAsync($"/api/Users/{validId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
    [Fact]
    public async Task GetUser_WithInvalidId_ReturnsNotFound()
    {
        int invalidId = 9999;

        var response = await _client.GetAsync($"/api/Users/{invalidId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
    }
}