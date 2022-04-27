using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Sharenima.Helpers;
using Sharenima.Models;
using YoutubeExplode;
using YoutubeExplode.Common;
using YoutubeExplode.Playlists;
using YoutubeExplode.Videos;

namespace Sharenima.Controllers;

[ApiController]
[Route("[controller]/{instanceName}")]
public class VideoController : ControllerBase {
    private readonly IHubContext<SignalRHub> _hubContext;

    public VideoController(IHubContext<SignalRHub> hubContext) {
        _hubContext = hubContext;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddVideoToQueue(string instanceName, string url) {
        MainContext mainContext = new MainContext();
        Instance? instance = InstanceHelper.GetInstanceByName(mainContext, instanceName);
        if (instance == null) return BadRequest("Instance not found.");
        var userId = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userId == null) return BadRequest("User ID not found.");
        Guid parsedUserId = Guid.Parse(userId.Value);

        if (instance.OwnerId != parsedUserId && !PermissionHelper.CheckIfUserHasPermissionValue(mainContext, instance.Id, parsedUserId, Permissions.CanAddVideos, "true")) return BadRequest("User does not have permissions to add videos to the queue.");
        YoutubeClient youtubeMetadata = new YoutubeClient();
        IReadOnlyList<PlaylistVideo>? playlist = null;
        Video video;

        try {
            playlist = await youtubeMetadata.Playlists.GetVideosAsync(url);
        } catch (Exception) {
            // must not be a playlist, lets try just retrieving a video
        }

        if (playlist == null) {
            try {
                video = await youtubeMetadata.Videos.GetAsync(url);
            } catch (Exception e) {
                return BadRequest(e.Message);
            }

            VideoQueue videoQueueEntry = new VideoQueue {
                InstanceId = instance.Id,
                CreatedDateTime = DateTime.UtcNow,
                AddedBy = parsedUserId,
                ThumbnailUrl = video.Thumbnails.MinBy(thumbnail => thumbnail.Resolution.Area)?.Url,
                Title = video.Title,
                Description = video.Description,
                Url = url,
                VideoId = video.Id
            };
            
            mainContext.VideoQueues.Add(videoQueueEntry);
            await mainContext.SaveChangesAsync();
            await _hubContext.Clients.Group(instanceName).SendAsync("VideoAddedToQueue", videoQueueEntry);
            return Ok();
        }

        List<VideoQueue> videoQueues = new List<VideoQueue>();
        foreach (PlaylistVideo playlistVideo in playlist) {
            video = await youtubeMetadata.Videos.GetAsync(playlistVideo.Id);
            VideoQueue videoQueueEntry = new VideoQueue {
                InstanceId = instance.Id,
                CreatedDateTime = DateTime.UtcNow,
                AddedBy = parsedUserId,
                ThumbnailUrl = video.Thumbnails.MinBy(thumbnail => thumbnail.Resolution.Area)?.Url,
                Title = video.Title,
                Description = video.Description,
                Url = url
            };
            videoQueues.Add(videoQueueEntry);
        }

        await mainContext.VideoQueues.AddRangeAsync(videoQueues);
        await mainContext.SaveChangesAsync();
        await _hubContext.Clients.Group(instanceName).SendAsync("VideoAddedToQueue", videoQueues);
        return Ok();
    }

    [Authorize]
    [HttpDelete]
    public async Task<IActionResult> RemoveVideoFromQueue(string instanceName, Guid videoId) {
        MainContext mainContext = new MainContext();
        Instance? instance = InstanceHelper.GetInstanceByName(mainContext, instanceName);
        if (instance == null) return BadRequest("Instance not found.");
        var userId = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userId == null) return BadRequest("User ID not found.");
        Guid parsedUserId = Guid.Parse(userId.Value);

        if (instance.OwnerId != parsedUserId && !PermissionHelper.CheckIfUserHasPermissionValue(mainContext, instance.Id, parsedUserId, Permissions.CanSkipVideos, "true")) return BadRequest("User does not have permissions to remove videos from the queue.");
        VideoQueue? videoQueue = mainContext.VideoQueues.FirstOrDefault(video => video.Id == videoId);
        if (videoQueue == null) return BadRequest("Video not found.");
        mainContext.VideoQueues.Remove(videoQueue);
        await mainContext.SaveChangesAsync();
        await _hubContext.Clients.Group(instanceName).SendAsync("VideoRemovedFromQueue", videoQueue);
        return Ok();
    }
}