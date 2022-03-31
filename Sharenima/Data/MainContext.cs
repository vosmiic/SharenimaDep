using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Sharenima.Models;

namespace Sharenima; 

public class MainContext : DbContext {
    private readonly IConfiguration _configuration;
    public DbSet<Instance> Instance { get; set; }

    public MainContext(IConfiguration configuration) {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={_configuration["DatabaseLocation"]}");
}