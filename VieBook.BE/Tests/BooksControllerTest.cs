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
        [Fact]
        public async Task GetBooks_ReturnsList()
        {
            // Seed
            using (var scope = _serviceProvider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();
                if (!ctx.Books.Any(b => b.Title == "Seed Book"))
                {
                    ctx.Books.Add(new Book
                    {
                        Title = "Seed Book",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow,
                        Owner = new User
                        {
                            Email = "owner@getbooks.com",
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow
                        }
                    });
                    ctx.SaveChanges();
                }
            }

            var response = await _client.GetAsync("/api/books");
            response.EnsureSuccessStatusCode();

            var books = await response.Content.ReadFromJsonAsync<List<BookDTO>>();
            Assert.NotNull(books);
            Assert.Contains(books!, b => b.Title == "Seed Book");
        }

        [Fact]
        public async Task PostBook_CreatesBook()
        {
            var dto = new BookDTO
            {
                Title = "New Book",
                Status = "Active",
                OwnerId = 1,
                CategoryIds = new List<int>()
            };

            var response = await _client.PostAsJsonAsync("/api/books", dto);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(result);
        }

        //[Fact]
        //public async Task PutBook_UpdatesBook()
        //{
        //    int bookId;
        //    using (var scope = _serviceProvider.CreateScope())
        //    {
        //        var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();
        //        var book = new Book
        //        {
        //            Title = "Old Title",
        //            Status = "Active",
        //            CreatedAt = DateTime.UtcNow,
        //            Owner = new User
        //            {
        //                Email = "owner@update.com",
        //                Status = "Active",
        //                CreatedAt = DateTime.UtcNow
        //            }
        //        };
        //        ctx.Books.Add(book);
        //        ctx.SaveChanges();
        //        bookId = book.BookId;
        //    }

        //    var dto = new BookDTO
        //    {
        //        BookId = bookId,
        //        Title = "Updated Title",
        //        Status = "Active",
        //        OwnerId = 1,
        //        CategoryIds = new List<int>()
        //    };

        //    var response = await _client.PutAsJsonAsync($"/api/books/{bookId}", dto);
        //    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        //    using (var scope = _serviceProvider.CreateScope())
        //    {
        //        var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();
        //        var updated = ctx.Books.Find(bookId);
        //        Assert.NotNull(updated);
        //        Assert.Equal("Updated Title", updated!.Title);
        //    }
        //}

        [Fact]
        public async Task DeleteBook_SetsStatusInActive()
        {
            int bookId;
            using (var scope = _serviceProvider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();
                var book = new Book
                {
                    Title = "To InActive",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    Owner = new User
                    {
                        Email = "owner@inactive.com",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow
                    }
                };
                ctx.Books.Add(book);
                ctx.SaveChanges();
                bookId = book.BookId;
            }

            var response = await _client.DeleteAsync($"/api/books/{bookId}");
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            using (var scope = _serviceProvider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();
                var deleted = ctx.Books.Find(bookId);
                Assert.NotNull(deleted);
                Assert.Equal("InActive", deleted!.Status);
            }
        }

        [Fact]
        public async Task GetBooksByOwner_ReturnsBooks()
        {
            int ownerId;
            using (var scope = _serviceProvider.CreateScope())
            {
                var ctx = scope.ServiceProvider.GetRequiredService<VieBookContext>();

                var owner = new User
                {
                    Email = "owner@books.com",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };
                ctx.Users.Add(owner);
                ctx.SaveChanges();
                ownerId = owner.UserId;

                ctx.Books.Add(new Book
                {
                    Title = "Owner Book",
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    OwnerId = ownerId
                });
                ctx.SaveChanges();
            }

            var response = await _client.GetAsync($"/api/books/owner/{ownerId}");
            response.EnsureSuccessStatusCode();

            var books = await response.Content.ReadFromJsonAsync<List<BookDTO>>();
            Assert.NotNull(books);
            Assert.Contains(books!, b => b.Title == "Owner Book");
        }

    }
}
