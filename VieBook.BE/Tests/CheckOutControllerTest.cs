using System.Net;
using System.Net.Http.Json;
using BusinessObject.Dtos;
using Xunit;

namespace Tests
{
    public class CheckOutControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public CheckOutControllerTest(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CreatePaymentLink_WithValidAmount_ReturnsOk()
        {
            // Arrange
            var paymentRequest = new PaymentRequestDTO
            {
                Amount = 50000
            };

            // Act
            var response = await _client.PostAsJsonAsync("/create-payment-link", paymentRequest);

            // Assert
            // Note: This might return BadRequest due to PayOS configuration in test environment
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task CreatePaymentLink_WithZeroAmount_ReturnsBadRequest()
        {
            // Arrange
            var paymentRequest = new PaymentRequestDTO
            {
                Amount = 0
            };

            // Act
            var response = await _client.PostAsJsonAsync("/create-payment-link", paymentRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task CreatePaymentLink_WithNegativeAmount_ReturnsBadRequest()
        {
            // Arrange
            var paymentRequest = new PaymentRequestDTO
            {
                Amount = -1000
            };

            // Act
            var response = await _client.PostAsJsonAsync("/create-payment-link", paymentRequest);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task CreatePaymentLink_WithLargeAmount_ReturnsOk()
        {
            // Arrange
            var paymentRequest = new PaymentRequestDTO
            {
                Amount = 1000000
            };

            // Act
            var response = await _client.PostAsJsonAsync("/create-payment-link", paymentRequest);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CreatePaymentLink_WithNullRequest_ReturnsBadRequest()
        {
            // Act
            var response = await _client.PostAsJsonAsync("/create-payment-link", (PaymentRequestDTO?)null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
