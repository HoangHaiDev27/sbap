// using System.Net;
// using System.Net.Http.Json;
// using System.Net.Http.Headers;
// using System.Collections.Generic;
// using BusinessObject.Dtos;
// using Xunit;

// namespace Tests
// {
//     public class ChapterPurchaseControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly HttpClient _client;

//         public ChapterPurchaseControllerTest(CustomWebApplicationFactory<Program> factory)
//         {
//             _client = factory.CreateClient();
//         }

// [Fact]
// public async Task CheckChapterOwnership_WithValidChapterId_ReturnsOk()
// {
//     int chapterId = 1; // Assuming chapterId 1 exists and user is authorized

//     var response = await _client.GetAsync($"/api/ChapterPurchase/check-ownership/{chapterId}");

//     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
// }
// [Fact]
// public async Task CheckChapterOwnership_WithInvalidChapterId_ReturnsOk()
// {
//     int chapterId = 999999; // Assuming chapterId 999999 does not exist

//     var response = await _client.GetAsync($"/api/ChapterPurchase/check-ownership/{chapterId}");

//     Assert.Equal(HttpStatusCode.OK, response.StatusCode); // Assuming the service returns OK with isOwned: false
// }
// [Fact]
// public async Task GetMyPurchases_ReturnsOk()
// {

//     var response = await _client.GetAsync("/api/ChapterPurchase/my-purchases");

//     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
// }
// [Fact]
// public async Task PurchaseChapters_WithValidData_ReturnsOk()
// {
//     var request = new ChapterPurchaseRequestDTO
//     {
//         BookId = 1,
//         ChapterIds = new List<int> { 1, 2 }
//     };

//     var response = await _client.PostAsJsonAsync("/api/ChapterPurchase/purchase", request);

//     Assert.Equal(HttpStatusCode.OK, response.StatusCode);
// }
// [Fact]
// public async Task PurchaseChapters_WithInvalidBookId_ReturnsBadRequest()
// {
//     var request = new ChapterPurchaseRequestDTO
//     {
//         BookId = 0,
//         ChapterIds = new List<int> { 1, 2 }
//     };

//     var response = await _client.PostAsJsonAsync("/api/ChapterPurchase/purchase", request);

//     Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
// }
// [Fact]
// public async Task PurchaseChapters_WithEmptyChapterIds_ReturnsBadRequest()
// {
//     var request = new ChapterPurchaseRequestDTO
//     {
//         BookId = 1,
//         ChapterIds = new List<int>()
//     };

//     var response = await _client.PostAsJsonAsync("/api/ChapterPurchase/purchase", request);

//     Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
// }
//     }
// }