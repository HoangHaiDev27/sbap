using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Collections.Generic;
using BusinessObject.Dtos;
using Xunit;

namespace Tests
{
    public class NotificationControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public NotificationControllerTest(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

[Fact]
public async Task CreateNotification_WithValidData_ReturnsCreated()
{
    var newNotification = new CreateNotificationDTO
    {
        UserId = 1,
        Type = "SYSTEM_ANNOUNCEMENT",
        Title = "Test Notification",
        Body = "This is a test notification."
    };

    var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
[Fact]
public async Task CreateNotification_WithInvalidUserId_ReturnsBadRequest()
{
    var newNotification = new CreateNotificationDTO
    {
        UserId = 0, // Invalid UserId
        Type = "SYSTEM_ANNOUNCEMENT",
        Title = "Test Notification",
        Body = "This is a test notification."
    };

    var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
[Fact]
public async Task CreateNotification_WithInvalidType_ReturnsBadRequest()
{
    var newNotification = new CreateNotificationDTO
    {
        UserId = 1,
        Type = "", // Invalid Type
        Title = "Test Notification",
        Body = "This is a test notification."
    };

    var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
[Fact]
public async Task CreateNotification_WithNullTitle_ReturnsBadRequest()
{
    var newNotification = new CreateNotificationDTO
    {
        UserId = 1,
        Type = "SYSTEM_ANNOUNCEMENT",
        Title = null, // Invalid Title
        Body = "This is a test notification."
    };

    var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
[Fact]
public async Task CreateNotification_WithNullBody_ReturnsBadRequest()
{
    var newNotification = new CreateNotificationDTO
    {
        UserId = 1,
        Type = "SYSTEM_ANNOUNCEMENT",
        Title = "Test Notification",
        Body = null // Invalid Body
    };

    var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
    }
}