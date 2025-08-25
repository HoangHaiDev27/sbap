using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class ChatConversation
{
    public long ConversationId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual ICollection<ChatParticipant> ChatParticipants { get; set; } = new List<ChatParticipant>();
}
