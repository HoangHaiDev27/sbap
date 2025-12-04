// using System.Net;
// using System.Net.Http.Json;
// using System.Net.Http.Headers;
// using System.Collections.Generic;
// using BusinessObject.Dtos;
// using Xunit;

// namespace Tests
// {
//     public class NotificationControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly HttpClient _client;

//         public NotificationControllerTest(CustomWebApplicationFactory<Program> factory)
//         {
//             _client = factory.CreateClient();
//         }

//         [Fact]
//         public async Task CreateNotification_WithValidData_ReturnsCreated()
//         {
//             // Arrange: tạo user trước
//             var newUser = new UserDTO
//             {
//                 Email = "notif_user@example.com",
//                 Status = "Active",
//                 Wallet = 50
//             };

//             var createUserResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
//             createUserResponse.EnsureSuccessStatusCode();
//             var createdUser = await createUserResponse.Content.ReadFromJsonAsync<UserDTO>();

//             var newNotification = new CreateNotificationDTO
//             {
//                 UserId = createdUser!.UserId,
//                 Type = "SYSTEM_ANNOUNCEMENT",
//                 Title = "Test Notification",
//                 Body = "This is a test notification."
//             };

//             // Act
//             var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

//             // Assert
//             Assert.Equal(HttpStatusCode.Created, response.StatusCode);
//         }
//         [Fact]
//         public async Task CreateNotification_WithInvalidUserId_ReturnsBadRequest()
//         {
//             var newNotification = new CreateNotificationDTO
//             {
//                 UserId = 0, // Invalid UserId
//                 Type = "SYSTEM_ANNOUNCEMENT",
//                 Title = "Test Notification",
//                 Body = "This is a test notification."
//             };

//             var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }
//         [Fact]
//         public async Task CreateNotification_WithInvalidType_ReturnsBadRequest()
//         {
//             var newNotification = new CreateNotificationDTO
//             {
//                 UserId = 1,
//                 Type = "", // Invalid Type
//                 Title = "Test Notification",
//                 Body = "This is a test notification."
//             };

//             var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }
//         [Fact]
//         public async Task CreateNotification_WithNullTitle_ReturnsBadRequest()
//         {
//             var newNotification = new CreateNotificationDTO
//             {
//                 UserId = 1,
//                 Type = "SYSTEM_ANNOUNCEMENT",
//                 Title = null, // Invalid Title
//                 Body = "This is a test notification."
//             };

//             var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }
//         [Fact]
//         public async Task CreateNotification_WithNullBody_ReturnsBadRequest()
//         {
//             var newNotification = new CreateNotificationDTO
//             {
//                 UserId = 1,
//                 Type = "SYSTEM_ANNOUNCEMENT",
//                 Title = "Test Notification",
//                 Body = null // Invalid Body
//             };

//             var response = await _client.PostAsJsonAsync("/api/notification", newNotification);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }




//         [Fact]
//         public async Task GetNotification_WithInvalidId_ReturnsNotFound()
//         {
//             var id = 999999; // ID không tồn tại

//             var response = await _client.GetAsync($"/api/notification/{id}");

//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetUserNotifications_WithValidUserId_ReturnsOk()
//         {
//             var userId = 1;

//             var response = await _client.GetAsync($"/api/notification/user/{userId}");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetUnreadNotifications_WithValidUserId_ReturnsOk()
//         {
//             var userId = 1;

//             var response = await _client.GetAsync($"/api/notification/user/{userId}/unread");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetNotificationsByType_WithValidUserIdAndType_ReturnsOk()
//         {
//             var userId = 1;
//             var type = "PAYMENT_SUCCESS";

//             var response = await _client.GetAsync($"/api/notification/user/{userId}/type/{type}");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetRecentNotifications_WithValidUserId_ReturnsOk()
//         {
//             var userId = 1;

//             var response = await _client.GetAsync($"/api/notification/user/{userId}/recent");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetUnreadCount_WithValidUserId_ReturnsOk()
//         {
//             var userId = 1;

//             var response = await _client.GetAsync($"/api/notification/user/{userId}/unread-count");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }




//         [Fact]
//         public async Task MarkAsRead_WithInvalidId_ReturnsNotFound()
//         {
//             var id = 9999;

//             var response = await _client.PutAsync($"/api/notification/{id}/mark-read", null);

//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//         }

//         [Fact]
//         public async Task MarkAllAsRead_WithValidUserId_ReturnsOk()
//         {
//             var userId = 1;

//             var response = await _client.PutAsync($"/api/notification/user/{userId}/mark-all-read", null);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }




//         [Fact]
//         public async Task DeleteNotification_WithInvalidId_ReturnsNotFound()
//         {
//             var id = 9999;

//             var response = await _client.DeleteAsync($"/api/notification/{id}");

//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//         }

//         [Fact]
//         public async Task CreateBulkNotifications_WithValidData_ReturnsOk()
//         {
//             var createDtos = new List<CreateNotificationDTO>
//     {
//         new CreateNotificationDTO { UserId = 1, Type = "PAYMENT_SUCCESS", Title = "Payment Success", Body = "Your payment was successful." },
//         new CreateNotificationDTO { UserId = 2, Type = "BOOK_PURCHASE", Title = "Book Purchased", Body = "You have purchased a new book." }
//     };

//             var response = await _client.PostAsJsonAsync("/api/notification/bulk", createDtos);

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }

//         [Fact]
//         public async Task CreateBulkNotifications_WithEmptyList_ReturnsBadRequest()
//         {
//             var createDtos = new List<CreateNotificationDTO>();

//             var response = await _client.PostAsJsonAsync("/api/notification/bulk", createDtos);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//         [Fact]
//         public async Task CreateBulkNotifications_WithInvalidData_ReturnsBadRequest()
//         {
//             var createDtos = new List<CreateNotificationDTO>
//     {
//         new CreateNotificationDTO { UserId = 0, Type = "PAYMENT_SUCCESS", Title = "Payment Success", Body = "Your payment was successful." }, // Invalid UserId
//         new CreateNotificationDTO { UserId = 2, Type = "INVALID_TYPE", Title = "Book Purchased", Body = "You have purchased a new book." }  // Invalid Type
//     };

//             var response = await _client.PostAsJsonAsync("/api/notification/bulk", createDtos);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetNotificationTypes_ReturnsOk()
//         {

//             var response = await _client.GetAsync("/api/notification/types");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }
//         // [Fact]
//         // public async Task GetNotification_WithValidId_ReturnsOk()
//         // {
//         //     // Arrange: tạo user
//         //     var newUser = new UserDTO
//         //     {
//         //         Email = $"user_{Guid.NewGuid()}@example.com",
//         //         Status = "Active",
//         //         Wallet = 100
//         //     };
//         //     var userResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
//         //     userResponse.EnsureSuccessStatusCode();
//         //     var createdUser = await userResponse.Content.ReadFromJsonAsync<UserDTO>();

//         //     // Arrange: tạo notification
//         //     var newNotification = new CreateNotificationDTO
//         //     {
//         //         UserId = createdUser.UserId,
//         //         Type = "SYSTEM_ANNOUNCEMENT",
//         //         Title = "Test Notification",
//         //         Body = "This is a test notification."
//         //     };


//         //     var notificationResponse = await _client.PostAsJsonAsync("/api/notification", newNotification);
//         //     notificationResponse.EnsureSuccessStatusCode();
//         //     var createdNotification = await notificationResponse.Content.ReadFromJsonAsync<NotificationDTO>();
//         //     Console.WriteLine($"Created NotificationId: {createdNotification.NotificationId}");
//         //     // Act
//         //     var response = await _client.GetAsync($"/api/notification/{createdNotification.NotificationId}");

//         //     // Assert
//         //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         // }

//         // [Fact]
//         // public async Task DeleteNotification_WithValidId_ReturnsOk()
//         // {
//         //     // Arrange: tạo user
//         //     var newUser = new UserDTO
//         //     {
//         //         Email = $"user_{Guid.NewGuid()}@example.com",
//         //         Status = "Active",
//         //         Wallet = 100
//         //     };
//         //     var userResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
//         //     userResponse.EnsureSuccessStatusCode();
//         //     var createdUser = await userResponse.Content.ReadFromJsonAsync<UserDTO>();

//         //     // Arrange: tạo notification
//         //     var newNotification = new CreateNotificationDTO
//         //     {
//         //         UserId = createdUser.UserId,
//         //         Type = "SYSTEM_ANNOUNCEMENT",
//         //         Title = "Delete Test",
//         //         Body = "Notification for delete test."
//         //     };
//         //     var notificationResponse = await _client.PostAsJsonAsync("/api/notification", newNotification);
//         //     notificationResponse.EnsureSuccessStatusCode();
//         //     var createdNotification = await notificationResponse.Content.ReadFromJsonAsync<NotificationDTO>();

//         //     // Act
//         //     var response = await _client.DeleteAsync($"/api/notification/{createdNotification.NotificationId}");

//         //     // Assert
//         //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         // }

//         // [Fact]
//         // public async Task MarkAsRead_WithValidId_ReturnsOk()
//         // {
//         //     // Arrange: tạo user
//         //     var newUser = new UserDTO
//         //     {
//         //         Email = $"user_{Guid.NewGuid()}@example.com",
//         //         Status = "Active",
//         //         Wallet = 100
//         //     };
//         //     var userResponse = await _client.PostAsJsonAsync("/api/Users", newUser);
//         //     userResponse.EnsureSuccessStatusCode();
//         //     var createdUser = await userResponse.Content.ReadFromJsonAsync<UserDTO>();

//         //     // Arrange: tạo notification
//         //     var newNotification = new CreateNotificationDTO
//         //     {
//         //         UserId = createdUser.UserId,
//         //         Type = "SYSTEM_ANNOUNCEMENT",
//         //         Title = "Mark Read Test",
//         //         Body = "Notification for mark as read test."
//         //     };
//         //     var notificationResponse = await _client.PostAsJsonAsync("/api/notification", newNotification);
//         //     notificationResponse.EnsureSuccessStatusCode();
//         //     var createdNotification = await notificationResponse.Content.ReadFromJsonAsync<NotificationDTO>();

//         //     // Act
//         //     var response = await _client.PutAsync($"/api/notification/{createdNotification.NotificationId}/mark-read", null);

//         //     // Assert
//         //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         // }
//     }
// }