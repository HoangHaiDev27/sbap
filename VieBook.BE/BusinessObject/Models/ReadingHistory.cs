using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    [Table("ReadingHistory")]
    public class ReadingHistory
    {
        [Key]
        public long ReadingHistoryId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int BookId { get; set; }

        public int? ChapterId { get; set; }

        [Required]
        [StringLength(20)]
        public string ReadingType { get; set; } = string.Empty; // "Reading" hoặc "Listening"

        public int? AudioPosition { get; set; } // Vị trí audio hiện tại (giây) (chỉ cho Listening)

        [Required]
        public DateTime LastReadAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        [ForeignKey("ChapterId")]
        public virtual Chapter? Chapter { get; set; }
    }
}
