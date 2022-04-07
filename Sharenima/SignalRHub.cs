using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
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
        
        await Clients.All.SendAsync("Test", "working");
    }

    private static Guid? ConvertAccessTokenToUserId(string accessToken) {
        var handler = new JwtSecurityTokenHandler();
        var jwtSecurityToken = handler.ReadJwtToken(accessToken);
        var userId = jwtSecurityToken.Claims.First(x => x.Type == "sub")?.Value;
        
        return userId != null ? Guid.Parse(userId) : null;
    }
}