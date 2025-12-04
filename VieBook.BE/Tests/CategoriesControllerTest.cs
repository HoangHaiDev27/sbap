// using BusinessObject.Dtos;
// using BusinessObject.Models;
// using DataAccess;
// using Microsoft.Extensions.DependencyInjection;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Net.Http.Json;
// using System.Net;
// using System.Text;
// using System.Threading.Tasks;

// namespace Tests
// {
//     public class CategoriesControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly HttpClient _client;
//         private readonly IServiceProvider _serviceProvider;

//         public CategoriesControllerTest(CustomWebApplicationFactory<Program> factory)
//         {
//             _client = factory.CreateClient();
//             _serviceProvider = factory.Services;
//         }

//         [Fact]
//         public async Task GetCategories_ReturnsOkAndList()
//         {
//             // --- Seed ---
//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

//                 if (!context.Categories.Any(c => c.Name == "Seeded Category"))
//                 {
//                     context.Categories.Add(new Category
//                     {
//                         Name = "Seeded Category",
//                         Type = "Genre"
//                     });
//                     context.SaveChanges();
//                 }
//             }

//             // --- Act ---
//             var response = await _client.GetAsync("/api/categories");

//             // --- Assert ---
//             response.EnsureSuccessStatusCode();
//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);

//             var categories = await response.Content.ReadFromJsonAsync<List<CategoryDTO>>();
//             Assert.NotNull(categories);
//             Assert.Contains(categories!, c => c.Name == "Seeded Category");
//         }

//         [Fact]
//         public async Task GetCategory_ReturnsOk_WhenExists()
//         {
//             int categoryId;
//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();

//                 var cat = new Category { Name = "Single Category", Type = "Genre" };
//                 context.Categories.Add(cat);
//                 context.SaveChanges();
//                 categoryId = cat.CategoryId;
//             }

//             var response = await _client.GetAsync($"/api/categories/{categoryId}");

//             Assert.Equal(HttpStatusCode.OK, response.StatusCode);

//             var category = await response.Content.ReadFromJsonAsync<CategoryDTO>();
//             Assert.NotNull(category);
//             Assert.Equal(categoryId, category!.CategoryId);
//             Assert.Equal("Single Category", category.Name);
//         }

//         [Fact]
//         public async Task GetCategory_Returns404_WhenNotExists()
//         {
//             var response = await _client.GetAsync("/api/categories/99999");
//             Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
//         }

//         [Fact]
//         public async Task PostCategory_CreatesCategory()
//         {
//             var dto = new CategoryDTO { Name = "New Category", Type = "Genre" };

//             var response = await _client.PostAsJsonAsync("/api/categories", dto);

//             Assert.Equal(HttpStatusCode.Created, response.StatusCode);

//             var created = await response.Content.ReadFromJsonAsync<CategoryDTO>();
//             Assert.NotNull(created);
//             Assert.True(created!.CategoryId > 0);
//             Assert.Equal("New Category", created.Name);
//         }

//         [Fact]
//         public async Task PutCategory_UpdatesCategory()
//         {
//             int categoryId;
//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//                 var cat = new Category { Name = "Old Category", Type = "Genre" };
//                 context.Categories.Add(cat);
//                 context.SaveChanges();
//                 categoryId = cat.CategoryId;
//             }

//             var dto = new CategoryDTO
//             {
//                 CategoryId = categoryId,
//                 Name = "Updated Category",
//                 Type = "Genre"
//             };

//             var response = await _client.PutAsJsonAsync($"/api/categories/{categoryId}", dto);

//             Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//                 var updated = context.Categories.Find(categoryId);
//                 Assert.NotNull(updated);
//                 Assert.Equal("Updated Category", updated!.Name);
//             }
//         }

//         [Fact]
//         public async Task DeleteCategory_RemovesCategory()
//         {
//             int categoryId;
//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//                 var cat = new Category { Name = "To Delete", Type = "Genre" };
//                 context.Categories.Add(cat);
//                 context.SaveChanges();
//                 categoryId = cat.CategoryId;
//             }

//             var response = await _client.DeleteAsync($"/api/categories/{categoryId}");
//             Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

//             using (var scope = _serviceProvider.CreateScope())
//             {
//                 var context = scope.ServiceProvider.GetRequiredService<VieBookContext>();
//                 var deleted = context.Categories.Find(categoryId);
//                 Assert.Null(deleted);
//             }
//         }
//     }
// }
