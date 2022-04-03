using System;

namespace Sharenima.Models; 

public class Instance : ModelBase {
    public string Name { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime CreatedDate { get; set; }
    public Decimal TimeSinceStartOfCurrentVideo { get; set; }
}