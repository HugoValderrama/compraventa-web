using LaguitoLibre.Api.Common;
using LaguitoLibre.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LaguitoLibre.Api.DTOs.Perfil;

namespace LaguitoLibre.Api.Controllers;

[Authorize]
[Route("api/perfil")]
public class PerfilController : ApiControllerBase
{
    private readonly AppDbContext _context;

    public PerfilController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
public async Task<IActionResult> ObtenerPerfil()
{
    string run = CurrentRun;

    var usuario = await _context.Usuarios
        .AsNoTracking()
        .Where(u => u.Run == run)
        .Select(u => new
        {
            run = u.Run,
            nombre1 = u.Nombre1,
            nombre2 = u.Nombre2,
            apellido1 = u.Apellido1,
            apellido2 = u.Apellido2,
            fechaNacimiento = u.Fechanac,
            fechaRegistro = u.Fecharegistro,

            correos = u.Correos
                .Select(c => c.Correo1)
                .ToList(),

            telefonos = u.Telefonos
                .Select(t => t.Telefono1)
                .ToList(),

            esCliente = u.Cliente != null,
            esEmprendedor = u.Emprendedor != null
        })
        .FirstOrDefaultAsync();

    if (usuario == null)
    {
        return NotFoundMsg("Usuario no encontrado.");
    }

    return Success(
        usuario,
        "Perfil obtenido correctamente."
    );
}
[HttpPut]
public async Task<IActionResult> ActualizarPerfil(
    [FromBody] ActualizarPerfilRequest request)
{
    // Validar los datos ingresados
    var errores = PerfilValidator.Validar(request);

    if (errores.Count > 0)
    {
        return BadReq(
            "Los datos ingresados no son válidos.",
            errores.ToArray()
        );
    }

    // Obtener RUN desde el token JWT
    string run = CurrentRun;

    // Buscar usuario en PostgreSQL
    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Run == run);

    if (usuario == null)
    {
        return NotFoundMsg("Usuario no encontrado.");
    }

    // Actualizar datos personales
    usuario.Nombre1 = request.Nombre1;

    usuario.Nombre2 = string.IsNullOrEmpty(request.Nombre2)
        ? null
        : request.Nombre2;

    usuario.Apellido1 = request.Apellido1;

    usuario.Apellido2 = string.IsNullOrEmpty(request.Apellido2)
        ? null
        : request.Apellido2;

    usuario.Fechanac = request.FechaNacimiento;

    // Guardar cambios en PostgreSQL
    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail("No se pudo actualizar el perfil.")
        );
    }

    // Devolver el perfil actualizado
    return await ObtenerPerfil();
}
}