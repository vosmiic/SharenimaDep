using Sharenima.Models;

namespace Sharenima.Helpers;

public class PermissionHelper {
    public static bool CheckIfUserHasPermissionValue(MainContext mainContext, Guid instanceId, Guid userId, Permissions permission, string value) {
        var instanceRole = mainContext.InstanceRoles.ToList().FirstOrDefault(instanceRole => instanceRole.InstanceId == instanceId &&
                                                                                             instanceRole.Users.Contains(userId));
        if (instanceRole == null) return false;
        var rolePermission = mainContext.RolePermissions.FirstOrDefault(rolePermission => rolePermission.RoleId == instanceRole.Id &&
                                                                                          rolePermission.Permission == permission &&
                                                                                          rolePermission.Value == value);
        return rolePermission != null;
    }
}