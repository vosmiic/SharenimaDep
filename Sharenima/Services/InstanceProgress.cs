using Microsoft.AspNetCore.SignalR;
using Sharenima.Models;

namespace Sharenima.Services;

public class InstanceProgress : BackgroundService {
    private readonly IHubContext<SignalRHub> _hubContext;

    public InstanceProgress(IHubContext<SignalRHub> hubContext) {
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        while (!stoppingToken.IsCancellationRequested) {
            MainContext mainContext = new MainContext();

            foreach (Instance instance in mainContext.Instance) {
                await _hubContext.Clients.Group(instance.Name).SendAsync("ProgressChange", instance.TimeSinceStartOfCurrentVideo);
            }

            await Task.Delay(3000, stoppingToken);
        }
    }
}