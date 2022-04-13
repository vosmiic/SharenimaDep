using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sharenima.Data;
using Sharenima.Models;

namespace Sharenima.Controllers; 

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase {
    private ApplicationDbContext ApplicationDbContext { get; set; }
    
    public UserController(ApplicationDbContext applicationDbContext) {
        ApplicationDbContext = applicationDbContext;
    }

    [Authorize]
    [HttpGet]
    public IQueryable<ApplicationUser> ListUsers() {
        return ApplicationDbContext.Users.Select(applicationUser => new ApplicationUser { Id = applicationUser.Id, UserName = applicationUser.UserName });
    }
}