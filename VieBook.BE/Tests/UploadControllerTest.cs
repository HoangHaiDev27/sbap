// using System.Net;
// using System.Net.Http.Json;
// using System.Net.Http.Headers;
// using System.Collections.Generic;
// using BusinessObject.Dtos;
// using Xunit;

// namespace Tests
// {
//     public class UploadControllerTest : IClassFixture<CustomWebApplicationFactory<Program>>
//     {
//         private readonly HttpClient _client;

//         public UploadControllerTest(CustomWebApplicationFactory<Program> factory)
//         {
//             _client = factory.CreateClient();
//         }

//     [Fact]
//     public async Task UploadImage_WithValidFile_ReturnsOk()
//     {
//         var fileContent = new StreamContent(new MemoryStream(File.ReadAllBytes("testimage.jpg"))); // Replace with a real image file
//         fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/jpeg");

//         var formData = new MultipartFormDataContent();
//         formData.Add(fileContent, "file", "testimage.jpg");

//         var response = await _client.PostAsync("/api/Upload/bookImage", formData);

//         Assert.Equal(HttpStatusCode.OK, response.StatusCode);
//     }

//     [Fact]
//     public async Task UploadImage_WithInvalidFile_ReturnsBadRequest()
//     {
//         var fileContent = new StreamContent(new MemoryStream(File.ReadAllBytes("test.txt"))); // Replace with a real text file. Cloudinary service probably checks file type.
//         fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/plain");

//         var formData = new MultipartFormDataContent();
//         formData.Add(fileContent, "file", "test.txt");

//         var response = await _client.PostAsync("/api/Upload/bookImage", formData);

//         Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//     }

//      [Fact]
//         public async Task UploadImage_WithEmptyFile_ReturnsBadRequest()
//         {
//             var fileContent = new StreamContent(new MemoryStream(Array.Empty<byte>())); // Empty File

//             var formData = new MultipartFormDataContent();
//             formData.Add(fileContent, "file", "");

//             var response = await _client.PostAsync("/api/Upload/bookImage", formData);

//             Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
//         }

//     }
// }