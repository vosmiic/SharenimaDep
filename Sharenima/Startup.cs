using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Sharenima.Data;
using Sharenima.Helpers;
using Sharenima.Models;
using Sharenima.Services;
using Sharenima.UploadedFiles;
using tusdotnet;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using tusdotnet.Stores;

namespace Sharenima;

public class Startup {
    public static IConfiguration Configuration { get; private set; }

    public Startup(IConfiguration configuration) {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection serviceCollection) {
        var connectionString = Configuration.GetConnectionString("DefaultConnection");
        serviceCollection.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(connectionString));
        serviceCollection.AddDbContext<MainContext>();
        serviceCollection.AddDatabaseDeveloperPageExceptionFilter();

        serviceCollection.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
            .AddEntityFrameworkStores<ApplicationDbContext>();

        serviceCollection.AddIdentityServer(options => {
                options.IssuerUri = "https://localhost:44484"; //todo change for prod
            })
            .AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

        serviceCollection.AddAuthentication()
            .AddIdentityServerJwt();

        serviceCollection.TryAddEnumerable(
            ServiceDescriptor.Singleton<IPostConfigureOptions<JwtBearerOptions>,
                ConfigureJwtBearerOptions>());

        serviceCollection.AddControllersWithViews();
        serviceCollection.AddRazorPages();
        serviceCollection.AddCors(o => o.AddPolicy("CorsPolicy", builder => {
            builder.WithOrigins("https://localhost:44484")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }));

        serviceCollection.AddHostedService<InstanceProgress>();

        serviceCollection.AddSignalR(options => { options.EnableDetailedErrors = true; }
        ).AddJsonProtocol(options => { options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter()); });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
        if (env.IsDevelopment()) {
            app.UseMigrationsEndPoint();
        } else {
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();

        app.UseAuthentication();
        app.UseIdentityServer();
        app.UseAuthorization();

        app.UseCors("CorsPolicy");

        app.UseTus(httpContext => new DefaultTusConfiguration {
            Store = new TusDiskStore(Configuration["VideoUploadStorageLocation"]),
            UrlPath = "/upload",
            Events = new() {
                OnAuthorizeAsync = eventContext => {
                    if (!eventContext.HttpContext.User.Identity.IsAuthenticated) {
                        eventContext.FailRequest(HttpStatusCode.Unauthorized);
                        return Task.CompletedTask;
                    } else {
                        MainContext mainContext = new MainContext();
                        string? instanceName = eventContext.HttpContext.Request.Headers["instance"];
                        if (instanceName == null) {
                            eventContext.FailRequest(HttpStatusCode.BadRequest);
                            return Task.CompletedTask;
                        }

                        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);
                        if (instance == null) {
                            eventContext.FailRequest(HttpStatusCode.BadRequest);
                            return Task.CompletedTask;
                        }

                        var userId = eventContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                        if (userId == null) {
                            eventContext.FailRequest(HttpStatusCode.Unauthorized);
                            return Task.CompletedTask;
                        }

                        if (instance.OwnerId == Guid.Parse(userId.Value) || PermissionHelper.CheckIfUserHasPermissionValue(mainContext, instance.Id, Guid.Parse(userId.Value), Permissions.CanUploadVideos, "true")) {
                            return Task.CompletedTask;
                        } else {
                            eventContext.FailRequest(HttpStatusCode.Unauthorized);
                            return Task.CompletedTask;
                        }
                    }
                },
                OnFileCompleteAsync = async eventContext => {
                    UploadedVideoFile uploadedVideoFile = new UploadedVideoFile(eventContext);

                    VideoQueue video = await uploadedVideoFile.ProcessUploadedVideoFile();
                    if (!String.IsNullOrEmpty(video.Url)) {
                        MainContext mainContext = new MainContext();
                        var userId = eventContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                        string? instanceName = eventContext.HttpContext.Request.Headers["instance"];
                        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);

                        video.AddedBy = Guid.Parse(userId.Value);
                        video.CreatedDateTime = DateTime.UtcNow;
                        video.Description = "Uploaded video.";
                        video.InstanceId = instance.Id;

                        mainContext.VideoQueues.Add(video);
                        await mainContext.SaveChangesAsync();
                        var hub = eventContext.HttpContext.RequestServices.GetService<IHubContext<SignalRHub>>();
                        hub?.Clients.Group(eventContext.HttpContext.Request.Headers["instance"]).SendAsync("VideoAddedToQueue", video);
                    }
                }
            }
        });


        app.UseEndpoints(endpoints => {
            endpoints.MapRazorPages();
            endpoints.MapHub<SignalRHub>("/hub");
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller}/{action=Index}/{id?}");
            endpoints.MapFallbackToFile("index.html");
        });
    }
}
//var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
/*var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddDbContext<MainContext>();
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddIdentityServer()
    .AddApiAuthorization<ApplicationUser, ApplicationDbContext>();

builder.Services.AddAuthentication()
    .AddIdentityServerJwt();

builder.Services.TryAddEnumerable(
    ServiceDescriptor.Singleton<IPostConfigureOptions<JwtBearerOptions>,
        ConfigureJwtBearerOptions>());

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();
builder.Services.AddCors(o => o.AddPolicy("CorsPolicy", builder => {
    builder.WithOrigins("https://localhost:44484")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
}));

builder.Services.AddSignalR(options => { options.EnableDetailedErrors = true; });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseMigrationsEndPoint();
} else {
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseIdentityServer();
app.UseAuthorization();

app.UseCors("CorsPolicy");

app.MapHub<SignalRHub>("/hub");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
app.MapRazorPages();

app.MapFallbackToFile("index.html");
;

app.Run();*/