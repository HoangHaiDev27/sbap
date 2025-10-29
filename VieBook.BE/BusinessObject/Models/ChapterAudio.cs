using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class ChapterAudio
{
    public int AudioId { get; set; }               

    public int ChapterId { get; set; }             

    public int UserId { get; set; }                 

    public string AudioLink { get; set; } = null!; 

    public int? DurationSec { get; set; }          

    public decimal? PriceSoft { get; set; }        

    public DateTime CreatedAt { get; set; }         

    public string? VoiceName { get; set; }          

    public virtual Chapter Chapter { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
