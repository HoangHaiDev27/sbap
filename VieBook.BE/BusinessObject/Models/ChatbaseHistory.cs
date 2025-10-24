namespace BusinessObject.Models
{
    public class ChatbaseHistory
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty; // "user" hoặc "bot"
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}