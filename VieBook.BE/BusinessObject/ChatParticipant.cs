using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class ChatParticipant
{
    public long ConversationId { get; set; }

    public int UserId { get; set; }

    public string? RoleHint { get; set; }

    public DateTime JoinedAt { get; set; }

    public virtual ChatConversation Conversation { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
