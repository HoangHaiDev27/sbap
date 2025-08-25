using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class ChatMessage
{
    public long MessageId { get; set; }

    public long ConversationId { get; set; }

    public int SenderId { get; set; }

    public string? MessageText { get; set; }

    public string? AttachmentUrl { get; set; }

    public DateTime SentAt { get; set; }

    public virtual ChatConversation Conversation { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
