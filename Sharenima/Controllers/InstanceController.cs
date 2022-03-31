using Microsoft.AspNetCore.Mvc;
using Sharenima.Models;

namespace Sharenima.Controllers;

[ApiController]
[Route("[controller]")]
public class InstanceController : ControllerBase {
    private readonly IConfiguration _configuration;

    public InstanceController(IConfiguration configuration) {
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInstance([FromBody] Instance instance) {
        MainContext mainContext = new MainContext(_configuration);
        if (instance.Name != null) {
            if (mainContext.Instance.Any(item => item.Name == instance.Name)) {
                return BadRequest("An instance with that name already exists.");
            }
            instance.CreatedDate = DateTime.UtcNow;
            mainContext.Instance.Add(instance);
            await mainContext.SaveChangesAsync();
            return Created("", instance);
        }

        return BadRequest("Instance name must be supplied.");
    }

    [HttpGet]
    [Route("{instanceName}")]
    public async Task<IActionResult> GetInstance(string instanceName) {
        MainContext mainContext = new MainContext(_configuration);
        Instance? instance = mainContext.Instance.FirstOrDefault(instance => instance.Name == instanceName);

        if (instance != null) {
            return Ok(instance);
        }

        return NotFound();
    }
}