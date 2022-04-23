using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.SignalR;
using Sharenima.Helpers;
using Sharenima.Models;
using YoutubeExplode;
using YoutubeExplode.Common;
using YoutubeExplode.Exceptions;
using YoutubeExplode.Playlists;
using YoutubeExplode.Videos;

namespace Sharenima;

public class SignalRHub : Hub {
    public async Task ReceiveClientTime(string instanceName, string token, decimal time) {
        Guid? userId = ConvertAccessTokenToUserId(token);
        if (userId == null) return;
        MainContext mainContext = new MainContext();
        Instance? instance = InstanceHelper.GetInstanceByName(mainContext, instanceName);
        if (instance == null || instance.TimeSinceStartOfCurrentVideo == time) return;
        if (instance.OwnerId == userId || PermissionHelper.CheckIfUserHasPermissionValue(mainContext, instance.Id, userId.Value, Permissions.CanChangeVideoTime, "true")) {
            instance.TimeSinceStartOfCurrentVideo = time;
            await mainContext.SaveChangesAsync();
        }
    }

    public async Task StateChange(string instanceName, string token, State state) {
        Guid? userId = ConvertAccessTokenToUserId(token);
        if (userId == null) return;
        MainContext mainContext = new MainContext();
        Instance? instance = InstanceHelper.GetInstanceByName(mainContext, instanceName);
        if (instance == null) return;
        if (instance.State != state) {
            if (instance.OwnerId == userId || PermissionHelper.CheckIfUserHasPermissionValue(mainContext, instance.Id, userId.Value, Permissions.CanPauseResumeVideos, "true")) {
                instance.State = state;
                await mainContext.SaveChangesAsync();
                await Clients.Group(instanceName).SendAsync("StateChange", state);
            }
        }
    }

    public async Task JoinGroup(string group) {
        await Groups.AddToGroupAsync(Context.ConnectionId, group);
    }

    private static Guid? ConvertAccessTokenToUserId(string accessToken) {
        var handler = new JwtSecurityTokenHandler();
        var jwtSecurityToken = handler.ReadJwtToken(accessToken);
        var userId = jwtSecurityToken.Claims.First(x => x.Type == "sub")?.Value;

        return userId != null ? Guid.Parse(userId) : null;
    }
}