using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Services.Implementations;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VieBook.BE.Controllers;

namespace Tests
{
    //public class UploadControllerTest
    //{
    //    private readonly Mock<ICloudinaryService> _mockService;
    //    private readonly UploadController _controller;

    //    public UploadControllerTest()
    //    {
    //        _mockService = new Mock<ICloudinaryService>();
    //        _controller = new UploadController(_mockService.Object);
    //    }

    //    [Fact]
    //    public async Task UploadImage_ReturnsOk_WhenUploadSuccess()
    //    {
    //        // Arrange
    //        var fileMock = new Mock<IFormFile>();
    //        _mockService.Setup(s => s.UploadBookImageAsync(It.IsAny<IFormFile>()))
    //            .ReturnsAsync("http://mock.cloudinary.com/test.jpg");

    //        // Act
    //        var result = await _controller.UploadImage(fileMock.Object);

    //        // Assert
    //        var okResult = Assert.IsType<OkObjectResult>(result);
    //        Assert.Contains("http://mock.cloudinary.com", okResult.Value.ToString());
    //    }

    //    [Fact]
    //    public async Task UploadImage_ReturnsBadRequest_WhenUploadFails()
    //    {
    //        // Arrange
    //        var fileMock = new Mock<IFormFile>();
    //        _mockService.Setup(s => s.UploadBookImageAsync(It.IsAny<IFormFile>()))
    //            .ReturnsAsync((string?)null);

    //        // Act
    //        var result = await _controller.UploadImage(fileMock.Object);

    //        // Assert
    //        var badResult = Assert.IsType<BadRequestObjectResult>(result);
    //        Assert.Equal("Upload thất bại", badResult.Value);
    //    }
    //}

}
