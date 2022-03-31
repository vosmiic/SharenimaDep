using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Sharenima; 

public class SignalRHub : Hub {
    public async Task ReceiveClientTime(decimal time) {
        await Clients.All.SendAsync("Test", "working");
    }
}