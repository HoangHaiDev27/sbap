namespace BusinessObject.Dtos
{
    public class UpdateCompletionStatusDTO
    {
        public string CompletionStatus { get; set; } = null!;
        public string? UploadStatus { get; set; }
    }
}
