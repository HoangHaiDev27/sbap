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
        [Fact]
        public async Task GetReadBooks_ReturnsSuccessAndList()
        {
            // --- Seed dữ liệu trực tiếp ---
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

                // Kiểm tra nếu đã có sách phù hợp thì không seed lại
                if (!context.Books.Any(b => b.Title == "Test Read Book"))
                {
                    // Seed owner
                    var owner = new User
                    {
                        Email = "owner@readbooks.com",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow,
                        Wallet = 0,
                        UserProfile = new UserProfile { FullName = "Book Owner" }
                    };
                    context.Users.Add(owner);
                    context.SaveChanges();

                    // Seed book
                    var book = new Book
                    {
                        Title = "Test Read Book",
                        OwnerId = owner.UserId,
                        CoverUrl = "https://example.com/book.jpg",
                        Description = "A test book for reading endpoint",
                        Status = "Published",
                        TotalView = 10,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Books.Add(book);
                    context.SaveChanges();

                    // Seed chapter (có ChapterSoftUrl để service trả dữ liệu)
                    context.Chapters.Add(new Chapter
                    {
                        BookId = book.BookId,
                        ChapterTitle = "Chapter 1",
                        ChapterSoftUrl = "https://example.com/ch1.pdf",
                        DurationSec = 600,
                        PriceAudio = 15000
                    });
                    context.SaveChanges();

                    // Seed category
                    var category = new Category { Name = "Test Category", Type = "Genre" };
                    context.Categories.Add(category);
                    context.SaveChanges();

                    // Map book → category qua BookCategory
                    // context.BookCategories.Add(new BookCategory
                    // {
                    //     BookId = book.BookId,
                    //     CategoryId = category.CategoryId
                    // });
                    // context.SaveChanges();

                    // Seed review
                    context.BookReviews.Add(new BookReview
                    {
                        BookId = book.BookId,
                        UserId = owner.UserId,
                        Rating = 5,
                        Comment = "Excellent!"
                    });
                    context.SaveChanges();
                }
            }

            // --- Gọi API ---
            var response = await _client.GetAsync("/api/books/read");

            // --- Assert ---
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var books = await response.Content.ReadFromJsonAsync<List<BookResponseDTO>>();
            Assert.NotNull(books);

            // Kiểm tra field quan trọng
            Assert.All(books!, b =>
            {
                Assert.True(b.Id > 0);
                Assert.False(string.IsNullOrEmpty(b.Title));
                Assert.False(string.IsNullOrEmpty(b.Author));
            //    Assert.False(string.IsNullOrEmpty(b.Category)); 
                Assert.True(b.Price >= 0);
                Assert.True(b.Chapters > 0);
                Assert.False(string.IsNullOrEmpty(b.Duration));
            });
        }

    }
}
