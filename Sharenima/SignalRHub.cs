using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.SignalR;
using Sharenima.Models;

namespace Sharenima;

public class SignalRHub : Hub {
    public async Task ReceiveClientTime(string instanceName, string token, decimal time) {
        Guid? userId = ConvertAccessTokenToUserId(token);
        if (userId == null) return;
        MainContext mainContext = new MainContext();
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);
        if (instance == null) return;
        if (instance.OwnerId == userId && instance.TimeSinceStartOfCurrentVideo != time) {
            instance.TimeSinceStartOfCurrentVideo = time;
            await mainContext.SaveChangesAsync();
        } else {
            return;
        }
    }

    public async Task StateChange(string instanceName, string token, State state) {
        Guid? userId = ConvertAccessTokenToUserId(token);
        if (userId == null) return;
        MainContext mainContext = new MainContext();
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);
        if (instance == null) return;
        if (instance.OwnerId == userId && instance.State != state) {
            instance.State = state;
            await mainContext.SaveChangesAsync();
            await Clients.Group(instanceName).SendAsync("StateChange", state);
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