using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LaguitoLibre.API.Data;
using LaguitoLibre.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace LaguitoLibre.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public record LoginRequest(string Run, string Clave);

    public record RegistroRequest(
        string Run,
        string Nombre1,
        string? Nombre2,
        string Apellido1,
        string? Apellido2,
        string Clave,
        DateOnly Fechanac
    );

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegistroRequest request)
    {
        var existe = await _context.Usuario.AnyAsync(u => u.Run == request.Run);
        if (existe)
        {
            return BadRequest(new { mensaje = "El RUN ya se encuentra registrado." });
        }

        var nuevoUsuario = new Usuario
        {
            Run = request.Run,
            Nombre1 = request.Nombre1,
            Nombre2 = request.Nombre2,
            Apellido1 = request.Apellido1,
            Apellido2 = request.Apellido2,
            Clave = BCrypt.Net.BCrypt.HashPassword(request.Clave),
            Fechanac = request.Fechanac,
            Fecharegistro = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        _context.Usuario.Add(nuevoUsuario);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Usuario registrado exitosamente", run = nuevoUsuario.Run });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuario
            .Include(u => u.Administrador)
            .Include(u => u.Emprendedor)
            .Include(u => u.Cliente)
            .FirstOrDefaultAsync(u => u.Run == request.Run);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Clave, usuario.Clave))
        {
            return Unauthorized(new { mensaje = "RUN o contraseña incorrectos." });
        }

        var roles = new List<string>();
        if (usuario.Administrador != null) roles.Add("administrador");
        if (usuario.Emprendedor != null) roles.Add("emprendedor");
        if (usuario.Cliente != null) roles.Add("cliente");
        if (roles.Count == 0) roles.Add("cliente");

        var token = GenerarJwtToken(usuario, roles);

        return Ok(new
        {
            token,
            usuario = new
            {
                id = usuario.Run,
                nombre = $"{usuario.Nombre1} {usuario.Apellido1}",
                roles
            }
        });
    }

    private string GenerarJwtToken(Usuario usuario, List<string> roles)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Run),
            new Claim(ClaimTypes.Name, $"{usuario.Nombre1} {usuario.Apellido1}")
        };

        foreach (var rol in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, rol));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
