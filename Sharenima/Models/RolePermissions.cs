using System.ComponentModel;

namespace Sharenima.Models;

public class RolePermissions : ModelBase {
    public Guid RoleId { get; set; }
    public Permissions Permission { get; set; }
    public string Value { get; set; }

}

public enum Permissions {
    [Description("Can Rename Server?")]
    CanRenameServer,
    [Description("Can Change Video Time?")]
    CanChangeVideoTime,
    [Description("Can Add Videos?")]
    CanAddVideos,
    [Description("Can Delete Videos?")]
    CanDeleteVideos,
    [Description("Can Skip Videos?")]
    CanSkipVideos,
    [Description("Can Chat?")]
    CanChat
}