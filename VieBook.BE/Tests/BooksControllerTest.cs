using System.Net;
using System.Net.Http.Json;
using BusinessObject.Models;
using BusinessObject.Dtos;
using DataAccess;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Tests
{
    public class BooksControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly IServiceProvider _serviceProvider;

        public BooksControllerTest(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
            _serviceProvider = factory.Services;
        }

        [Fact]
        public async Task GetBookDetail_ReturnsOk_WhenBookExists()
        {
            int bookId;

            // Seed dữ liệu trực tiếp vào InMemory DB
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

                var book = new Book
                {
                    Title = "Test Book",
                    OwnerId = 1,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    TotalView = 10,
                    Owner = new User
                    {
                        Email = "owner@test.com",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow,
                        Wallet = 0
                    }
                };

                context.Books.Add(book);
                context.SaveChanges();
                bookId = book.BookId;
            }

            // Act
            var response = await _client.GetAsync($"/api/books/{bookId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var bookDetail = await response.Content.ReadFromJsonAsync<BookDetailDTO>();
            Assert.NotNull(bookDetail);
            Assert.Equal(bookId, bookDetail.BookId);
            Assert.Equal("Test Book", bookDetail.Title);
        }

        [Fact]
        public async Task GetBookDetail_Returns404_WhenBookDoesNotExist()
        {
            // Act
            var response = await _client.GetAsync("/api/books/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
