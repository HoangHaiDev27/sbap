using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class ExternalLogin
{
    public int ExternalLoginId { get; set; }

    public int UserId { get; set; }

    public string Provider { get; set; } = null!;

    public string ProviderKey { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
