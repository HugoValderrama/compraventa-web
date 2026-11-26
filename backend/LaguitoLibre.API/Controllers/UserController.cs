using System.Security.Claims;
using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Exige enviar el Token JWT válido
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/users/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        // Obtenemos el RUN del usuario autenticado desde el Token JWT
        var run = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(run))
        {
            return Unauthorized(new { mensaje = "Token inválido o sin identificación de usuario." });
        }

        var usuario = await _context.Usuario
            .Include(u => u.Correo)
            .Include(u => u.Telefono)
            .Include(u => u.Direccion)
            .Include(u => u.Administrador)
            .Include(u => u.Cliente)
            .Include(u => u.Emprendedor)
                .ThenInclude(e => e!.Empresa)
            .FirstOrDefaultAsync(u => u.Run == run);

        if (usuario == null)
        {
            return NotFound(new { mensaje = "Usuario no encontrado." });
        }

        // Armamos los roles en minúsculas
        var roles = new List<string>();
        if (usuario.Administrador != null) roles.Add("administrador");
        if (usuario.Emprendedor != null) roles.Add("emprendedor");
        if (usuario.Cliente != null) roles.Add("cliente");
        if (roles.Count == 0) roles.Add("cliente");

        // Formateamos la primera dirección si tiene una registrada
        var primeraDir = usuario.Direccion.FirstOrDefault();
        string direccionPrincipal = primeraDir != null
            ? $"{primeraDir.Calle} {primeraDir.Numero}" +
              (string.IsNullOrWhiteSpace(primeraDir.Departamento) ? "" : $", Depto {primeraDir.Departamento}")
            : "";

        // Formateamos la empresa si el usuario es emprendedor
        object? empresa = null;
        if (usuario.Emprendedor != null)
        {
            empresa = new
            {
                id = usuario.Emprendedor.EmpresaId,
                razonSocial = usuario.Emprendedor.Empresa?.Razonsocial ?? "", // Ajusta si el campo se llama distinto en Empresa.cs
                rut = usuario.Emprendedor.EmpresaId ?? "",
                giro = "",
                paginaWeb = usuario.Emprendedor.Paginaweb ?? "",
                direccionLocal = ""
            };
        }

        return Ok(new
        {
            id = usuario.Run,
            run = usuario.Run,
            nombres = string.Join(" ", new[] { usuario.Nombre1, usuario.Nombre2 }.Where(s => !string.IsNullOrWhiteSpace(s))),
            apellidos = string.Join(" ", new[] { usuario.Apellido1, usuario.Apellido2 }.Where(s => !string.IsNullOrWhiteSpace(s))),
            fechaNacimiento = usuario.Fechanac.ToString("yyyy-MM-dd"),
            fechaRegistro = usuario.Fecharegistro.ToString("yyyy-MM-dd"),
            direccionPrincipal,
            correos = usuario.Correo.Select(c => c.Correo1).ToList(),
            telefonos = usuario.Telefono.Select(t => t.Telefono1.ToString()).ToList(),
            roles,
            empresa
        });
    }
}
