namespace Sharenima.Models;

public class InstanceRoles : ModelBase {
    public string RoleName { get; set; }
    public Guid InstanceId { get; set; }
    public List<Guid> Users { get; set; }
    public List<Permissions> Permissions { get; set; }
}

public enum Permissions {
    CanRenameServer,
    CanChangeVideoTime,
    CanAddVideos,
    CanDeleteVideos,
    CanSkipVideos,
    CanChat
}