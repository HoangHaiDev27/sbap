using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class RefreshToken
    {
        [Key]
        public Guid TokenId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string TokenHash { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? RevokedAt { get; set; }

        [MaxLength(255)]
        public string? ReplacedByToken { get; set; }

        [MaxLength(500)]
        public string? ReasonRevoked { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        // Helper properties
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt.HasValue;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
