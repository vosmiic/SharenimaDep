using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sharenima.Models;

namespace Sharenima.Controllers; 

[ApiController]
[Route("[controller]")]
public class RolesController : ControllerBase {
    
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> SaveInstanceRole(Guid roleId, [FromBody] RoleRequest roleRequest) {
        MainContext mainContext = new MainContext();

        var permissions = mainContext.RolePermissions;
        foreach (PermissionView rolePermission in roleRequest.Permissions) {
            var permission = permissions.FirstOrDefault(permission => permission.RoleId == roleId && permission.Permission == rolePermission.Name);
            if (permission != null) {
                if (permission.Value != rolePermission.Value) {
                    permission.Value = rolePermission.Value;
                }
            } else {
                permissions.Add(new RolePermissions {
                    Permission = rolePermission.Name,
                    RoleId = roleId,
                    Value = rolePermission.Value
                });
            }
        }

        var role = mainContext.InstanceRoles.FirstOrDefault(roles => roles.Id == roleId);
        if (role == null) return BadRequest("Role not found.");
        role.Users = roleRequest.Users.Select(user => Guid.Parse(user.Id)).ToList();

        await mainContext.SaveChangesAsync();
        return Ok();
    }
}