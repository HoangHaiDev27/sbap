namespace BusinessObject.Chatbase
{
    public class ChatbaseRequest
    {
        public string Question { get; set; } = string.Empty;
        public int? UserId { get; set; } = null;
    }
}