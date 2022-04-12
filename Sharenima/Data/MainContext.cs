using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Sharenima.Models;

namespace Sharenima;

public class MainContext : DbContext {
    public DbSet<Instance> Instance { get; set; }
    public DbSet<InstanceRoles> InstanceRoles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder
            .Entity<InstanceRoles>()
            .Property(item => item.Permissions)
            .HasConversion(
                item => string.Join(";", item),
                item => item.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                    .Select(roles => Enum.Parse(typeof(Permissions), roles))
                    .Cast<Permissions>()
                    .ToList());
        modelBuilder
            .Entity<InstanceRoles>()
            .Property(item => item.Users)
            .HasConversion(
                item => string.Join(";", item),
                item => item.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                    .Select(Guid.Parse)
                    .ToList());
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={Startup.Configuration["DatabaseLocation"]}");
}