using System.Security.Claims;
using System.Text;
using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace LaguitoLibre.API.Controllers;

// SOLO PARA DESARROLLO: entrega un JWT para un RUN existente, sin contraseña, para poder
// probar los endpoints protegidos mientras no exista POST /api/auth/login.
// Responde 404 fuera de Development. BÓRRALO cuando tengas el login real.
[ApiController]
[AllowAnonymous]
[Route("api/dev")]
public class DevController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IWebHostEnvironment _env;

    public DevController(AppDbContext db, IConfiguration config, IWebHostEnvironment env)
    {
        _db = db;
        _config = config;
        _env = env;
    }

    // GET /api/dev/token/{run}
    [HttpGet("token/{run}")]
    public async Task<IActionResult> Token(string run)
    {
        if (!_env.IsDevelopment()) return NotFound();

        if (!await _db.Usuario.AnyAsync(u => u.Run == run))
            return NotFound(new { detail = $"No existe un usuario con RUN {run}." });

        var roles = new List<string>();
        if (await _db.Cliente.AnyAsync(c => c.UsuarioId == run)) roles.Add("cliente");
        if (await _db.Emprendedor.AnyAsync(e => e.UsuarioId == run)) roles.Add("emprendedor");
        if (await _db.Administrador.AnyAsync(a => a.UsuarioId == run)) roles.Add("administrador");

        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, run) };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var clave = _config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(clave) || Encoding.UTF8.GetByteCount(clave) < 32)
            return Problem(
                detail: "Jwt:Key debe tener al menos 32 caracteres. Defínela con: dotnet user-secrets set \"Jwt:Key\" \"<clave larga>\"",
                statusCode: 500);

        var minutos = _config.GetValue("Jwt:ExpiraMinutos", 120);
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(minutos),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(clave)),
                SecurityAlgorithms.HmacSha256),
        };

        var token = new JsonWebTokenHandler().CreateToken(descriptor);
        return Ok(new { token, run, roles });
    }
}
