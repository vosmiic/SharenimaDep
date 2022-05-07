using System.Text.Json.Serialization;

namespace Sharenima.Models;

public class VideoQueue : ModelBase {
    public Guid InstanceId { get; set; }
    public string? VideoId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Url { get; set; }
    public string ThumbnailUrl { get; set; }
    public Guid AddedBy { get; set; }
    public DateTime CreatedDateTime { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public VideoType Type { get; set; }
}

public enum VideoType {
    YoutubeVideo,
    UploadedVideo
}