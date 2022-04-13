using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sharenima.Models;

namespace Sharenima.Controllers;

[ApiController]
[Route("[controller]")]
public class InstanceController : ControllerBase {
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateInstance([FromBody] Instance instance) {
        MainContext mainContext = new MainContext();
        if (instance.Name != null) {
            if (mainContext.Instance.Any(item => item.Name == instance.Name)) {
                return BadRequest("An instance with that name already exists.");
            }

            //instance.Id = Guid.NewGuid();
            instance.OwnerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            instance.CreatedDate = DateTime.UtcNow;
            mainContext.Instance.Add(instance);
            await mainContext.SaveChangesAsync();
            return Created("", instance);
        }

        return BadRequest("Instance name must be supplied.");
    }

    [HttpGet]
    [Route("{instanceName}")]
    public IActionResult GetInstance(string instanceName) {
        MainContext mainContext = new MainContext();
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);

        if (instance != null) {
            return Ok(instance);
        }

        return NotFound();
    }

    [Authorize]
    [HttpGet]
    [Route("{instanceName}/roles")]
    public IActionResult GetInstanceRoles(string instanceName) {
        MainContext mainContext = new MainContext();
        var userId = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userId == null) return BadRequest("User ID not found.");
        Guid parsedUserId = Guid.Parse(userId.Value);
        
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName && instance.OwnerId == parsedUserId);
        if (instance == null) return BadRequest("Instance could not be found.");
        return Ok(mainContext.InstanceRoles.Where(roles => roles.InstanceId == instance.Id));
    }

    [Authorize]
    [HttpPost]
    [Route("{instanceName}/roles")]
    public async Task<IActionResult> CreateInstanceRole(string instanceName, string roleName) {
        MainContext mainContext = new MainContext();
        var userId = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userId == null) return BadRequest("User ID not found.");
        Guid parsedUserId = Guid.Parse(userId.Value);
        
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName && instance.OwnerId == parsedUserId);
        if (instance == null) return BadRequest("Instance could not be found.");

        InstanceRoles instanceRole = new InstanceRoles {
            //Id = Guid.NewGuid(),
            InstanceId = instance.Id,
            RoleName = roleName,
            Permissions = new List<Permissions>(),
            Users = new List<Guid>()
        };
        mainContext.InstanceRoles.Add(instanceRole);
        await mainContext.SaveChangesAsync();
        return Ok(instanceRole);
    }
}