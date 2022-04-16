namespace Sharenima.Models; 

public class RoleRequest {
    public List<ApplicationUser> Users { get; set; }
    public List<PermissionView> Permissions { get; set; }
}

public class PermissionView {
    public Permissions Name { get; set; }
    public string FriendlyName { get; set; }
    public string? Value { get; set; }
}