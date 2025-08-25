using System;
using System.Collections.Generic;

namespace BusinessObject;

public partial class ReadingSchedule
{
    public int ScheduleId { get; set; }

    public int UserId { get; set; }

    public int BookId { get; set; }

    public DateTime BeginReadAt { get; set; }

    public int ReadingTime { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
