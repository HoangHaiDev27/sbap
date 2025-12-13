namespace Services.Options
{
    /// <summary>
    /// Options chứa cấu hình Frontend URL
    /// Được configure từ Program.cs với giá trị từ ApiConfiguration
    /// </summary>
    public class FrontendOptions
    {
        public string BaseUrl { get; set; } = string.Empty;
    }
}

