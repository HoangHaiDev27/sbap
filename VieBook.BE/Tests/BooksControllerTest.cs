using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
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
                    Status = "Approved",
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
                        Status = "Approved",
                        TotalView = 10,
                        CreatedAt = DateTime.UtcNow,
                        Author = "Nguyễn Văn A"
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

                        PriceSoft = 15000,
                        Status = "Active" // Cần có Status = "Active" để được đếm trong Chapters count
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
                Assert.Equal("Nguyễn Văn A", b.Author);
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
                        Status = "Approved",
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
                Status = "Approved",
                OwnerId = 1,
                CategoryIds = new List<int>()
            };

            var response = await _client.PostAsJsonAsync("/api/books", dto);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(result.TryGetProperty("bookId", out var bookIdElement));
            Assert.True(bookIdElement.GetInt32() > 0);
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
                    Status = "Approved",
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
                    Status = "Approved",
                    CreatedAt = DateTime.UtcNow
                };
                ctx.Users.Add(owner);
                ctx.SaveChanges();
                ownerId = owner.UserId;

                ctx.Books.Add(new Book
                {
                    Title = "Owner Book",
                    Status = "Approved",
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

        [Fact]
        public async Task GetRelatedBooks_ReturnsBooks_WhenSameCategoryExists()
        {
            int bookId;
            int relatedBookId;

            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

                // Seed category
                var category = new Category { Name = "Test Genre", Type = "Genre" };
                context.Categories.Add(category);
                context.SaveChanges();

                // Seed main book
                var mainBook = new Book
                {
                    Title = "Main Book",
                    Status = "Approved",
                    CreatedAt = DateTime.UtcNow,
                    Owner = new User
                    {
                        Email = "owner@main.com",
                        Status = "Approved",
                        CreatedAt = DateTime.UtcNow
                    },
                    Categories = new List<Category> { category }
                };
                context.Books.Add(mainBook);
                context.SaveChanges();
                bookId = mainBook.BookId;

                // Seed related book
                var relatedBook = new Book
                {
                    Title = "Related Book",
                    Status = "Approved",
                    CreatedAt = DateTime.UtcNow,
                    Owner = new User
                    {
                        Email = "owner@related.com",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow
                    },
                    Categories = new List<Category> { category }
                };
                context.Books.Add(relatedBook);
                context.SaveChanges();
                relatedBookId = relatedBook.BookId;
            }

            // Act
            var response = await _client.GetAsync($"/api/books/{bookId}/related");

            // Assert
            response.EnsureSuccessStatusCode();
            var related = await response.Content.ReadFromJsonAsync<List<BookResponseDTO>>();

            Assert.NotNull(related);
            Assert.Contains(related, b => b.Id == relatedBookId);   // phải có sách liên quan
            Assert.DoesNotContain(related, b => b.Id == bookId);   // không chứa chính nó
        }


        [Fact]
        public async Task GetRelatedBooks_Returns404_WhenBookDoesNotExist()
        {
            var response = await _client.GetAsync("/api/books/99999/related");

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }


        [Fact]
        public async Task PutBook_WithInvalidId_ReturnsBadRequest()
        {
            var id = 1;
            var bookDto = new BookDTO { BookId = 2 };

            var response = await _client.PutAsJsonAsync($"/api/books/{id}", bookDto);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        // [Fact]
        // public async Task PutBook_WithNonExistingId_ReturnsNotFound()
        // {
        //     var id = 999999;
        //     var bookDto = new BookDTO { BookId = id };

        //     var response = await _client.PutAsJsonAsync($"/api/books/{id}", bookDto);

        //     Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        // }

        // [Fact]
        // public async Task GetAudioBooks_ReturnsOk()
        // {

        //     var response = await _client.GetAsync("/api/books/audio");

        //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // }

        // [Fact]
        // public async Task GetAudioBookDetail_WithValidId_ReturnsOk()
        // {
        //     var validId = 1; // Replace with a valid ID from your test data

        //     var response = await _client.GetAsync($"/api/books/audio/{validId}");

        //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // }

        // [Fact]
        // public async Task GetAudioBookDetail_WithInvalidId_ReturnsNotFound()
        // {
        //     var invalidId = 999999; // An ID that doesn't exist

        //     var response = await _client.GetAsync($"/api/books/audio/{invalidId}");

        //     Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        // }

        [Fact]
        public async Task SearchBooks_WithValidQuery_ReturnsOk()
        {
            var query = "Test"; // Replace with a valid search query

            var response = await _client.GetAsync($"/api/books/search?query={query}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        // [Fact]
        // public async Task SearchBooks_WithEmptyQuery_ReturnsOk()
        // {
        //     var query = "";

        //     var response = await _client.GetAsync($"/api/books/search?query={query}");

        //     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // }


    }
}
