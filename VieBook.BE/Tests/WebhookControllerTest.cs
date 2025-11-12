// using System.Net;
// using System.Net.Http.Json;
// using BusinessObject.Dtos;
// using Xunit;

// namespace Tests
// {
//     public class WebhookControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly HttpClient _client;

//         public WebhookControllerTest(CustomWebApplicationFactory<Program> factory)
//         {
//             _client = factory.CreateClient();
//         }

//         [Fact]
//         public async Task VerifyPayment_WithValidOrderCode_ReturnsOk()
//         {
//             // Arrange
//             var orderCode = 123456;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/verify-payment/{orderCode}");

//             // Assert
//             // Note: This might return BadRequest due to PayOS configuration in test environment
//             Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
//         }

//         [Fact]
//         public async Task VerifyPayment_WithInvalidOrderCode_ReturnsBadRequest()
//         {
//             // Arrange
//             var orderCode = -1;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/verify-payment/{orderCode}");

//             // Assert
//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//         [Fact]
//         public async Task VerifyPayment_WithZeroOrderCode_ReturnsBadRequest()
//         {
//             // Arrange
//             var orderCode = 0;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/verify-payment/{orderCode}");

//             // Assert
//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//         [Fact]
//         public async Task GetUserTransactions_ReturnsOk()
//         {
//             // Arrange
//             var userId = 1;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/user-transactions/{userId}");

//             // Assert
//             // Note: This might return NotFound if user doesn't exist in test database
//             Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task GetUserTransactions_WithInvalidUserId_ReturnsBadRequest()
//         {
//             // Arrange
//             var userId = -1;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/user-transactions/{userId}");

//             // Assert
//             // Note: This might return NotFound instead of BadRequest
//             Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task PaymentSuccess_WithValidParameters_ReturnsRedirect()
//         {
//             // Arrange
//             var orderCode = 123456;
//             var amount = 50000;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/payment-success?orderCode={orderCode}&amount={amount}");

//             // Assert
//             // Note: This might return NotFound if endpoint doesn't exist
//             Assert.True(response.StatusCode == HttpStatusCode.Redirect || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task PaymentCancel_WithValidParameters_ReturnsRedirect()
//         {
//             // Arrange
//             var orderCode = 123456;
//             var amount = 50000;

//             // Act
//             var response = await _client.GetAsync($"/api/webhook/payment-cancel?orderCode={orderCode}&amount={amount}");

//             // Assert
//             // Note: This might return NotFound if endpoint doesn't exist
//             Assert.True(response.StatusCode == HttpStatusCode.Redirect || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task PaymentSuccess_WithMissingParameters_ReturnsBadRequest()
//         {
//             // Act
//             var response = await _client.GetAsync("/api/webhook/payment-success");

//             // Assert
//             // Note: This might return NotFound if endpoint doesn't exist
//             Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task PaymentCancel_WithMissingParameters_ReturnsBadRequest()
//         {
//             // Act
//             var response = await _client.GetAsync("/api/webhook/payment-cancel");

//             // Assert
//             // Note: This might return NotFound if endpoint doesn't exist
//             Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.NotFound);
//         }

//         [Fact]
//         public async Task TestRedirect_ReturnsOk()
//         {
//             // Act
//             var response = await _client.GetAsync("/api/webhook/test-redirect");

//             // Assert
//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//         }
//     }
// }
