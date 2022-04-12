using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Sharenima.Data;
using Sharenima.Models;
using Sharenima.Services;

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