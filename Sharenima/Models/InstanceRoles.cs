using System.ComponentModel;

namespace Sharenima.Models;

public class InstanceRoles : ModelBase {
    public string RoleName { get; set; }
    public Guid InstanceId { get; set; }
    public List<Guid> Users { get; set; }
}