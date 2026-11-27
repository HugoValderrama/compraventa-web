using LaguitoLibre.Api.Common;
using LaguitoLibre.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LaguitoLibre.Api.DTOs.Perfil;
using LaguitoLibre.Api.Models;
using Npgsql;

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
    .OrderBy(t => t.Telefono1)
    .Select(t => "+56" + t.Telefono1.ToString())
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
[HttpPut("telefonos")]
public async Task<IActionResult> ActualizarTelefonos(
    [FromBody] ActualizarTelefonosRequest request)
{
    // Validar los teléfonos ingresados
    var errores = PerfilValidator.ValidarTelefonos(request);

    if (errores.Count > 0)
    {
        return BadReq(
            "Los teléfonos ingresados no son válidos.",
            errores.ToArray()
        );
    }

    // Obtener RUN desde el token JWT
    string run = CurrentRun;

    // Comprobar que el usuario existe
    bool existeUsuario = await _context.Usuarios
        .AnyAsync(u => u.Run == run);

    if (!existeUsuario)
    {
        return NotFoundMsg("Usuario no encontrado.");
    }

    // Normalizar y convertir los teléfonos a enteros
    var nuevosTelefonos = request.Telefonos
        .Select(t => int.Parse(
            PerfilValidator.NormalizarTelefono(t).Substring(3)
        ))
        .ToList();

    // Comprobar si pertenecen a otro usuario
    bool telefonoOcupado = await _context.Telefonos
        .AnyAsync(t =>
            nuevosTelefonos.Contains(t.Telefono1) &&
            t.UsuarioId != run
        );

    if (telefonoOcupado)
    {
        return ConflictMsg(
            "Uno o más teléfonos ya están registrados por otro usuario."
        );
    }

    // Obtener los teléfonos actuales del usuario
    var telefonosActuales = await _context.Telefonos
        .Where(t => t.UsuarioId == run)
        .ToListAsync();

    // Identificar teléfonos que deben eliminarse
    var telefonosEliminar = telefonosActuales
        .Where(t => !nuevosTelefonos.Contains(t.Telefono1))
        .ToList();

    _context.Telefonos.RemoveRange(telefonosEliminar);

    // Agregar solamente los teléfonos nuevos
    foreach (int numero in nuevosTelefonos)
    {
        bool existe = telefonosActuales
            .Any(t => t.Telefono1 == numero);

        if (!existe)
        {
            _context.Telefonos.Add(new Telefono
            {
                Telefono1 = numero,
                UsuarioId = run
            });
        }
    }

    // Guardar los cambios
    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
        when (ex.InnerException is PostgresException pg &&
              pg.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        return ConflictMsg(
            "Uno o más teléfonos ya están registrados."
        );
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail(
                "No se pudieron actualizar los teléfonos."
            )
        );
    }

    return await ObtenerPerfil();
}
[HttpPut("correos")]
public async Task<IActionResult> ActualizarCorreos(
    [FromBody] ActualizarCorreosRequest request)
{
    // Validar los correos ingresados
    var errores = PerfilValidator.ValidarCorreos(request);

    if (errores.Count > 0)
    {
        return BadReq(
            "Los correos ingresados no son válidos.",
            errores.ToArray()
        );
    }

    // Obtener RUN desde el token JWT
    string run = CurrentRun;

    // Comprobar que el usuario existe
    bool existeUsuario = await _context.Usuarios
        .AnyAsync(u => u.Run == run);

    if (!existeUsuario)
    {
        return NotFoundMsg("Usuario no encontrado.");
    }

    // Normalizar los correos ingresados
    var nuevosCorreos = request.Correos
        .Select(c => PerfilValidator.NormalizarCorreo(c))
        .ToList();

    // Comprobar si pertenecen a otro usuario
    bool correoOcupado = await _context.Correos
        .AnyAsync(c =>
            nuevosCorreos.Contains(c.Correo1.ToLower()) &&
            c.UsuarioId != run
        );

    if (correoOcupado)
    {
        return ConflictMsg(
            "Uno o más correos ya están registrados por otro usuario."
        );
    }

    // Obtener los correos actuales del usuario
    var correosActuales = await _context.Correos
        .Where(c => c.UsuarioId == run)
        .ToListAsync();

    // Identificar correos que deben eliminarse
    var correosEliminar = correosActuales
        .Where(c => !nuevosCorreos.Contains(c.Correo1))
        .ToList();

    _context.Correos.RemoveRange(correosEliminar);

    // Agregar solamente los correos nuevos
    foreach (string correo in nuevosCorreos)
    {
        bool existe = correosActuales
            .Any(c => c.Correo1 == correo);

        if (!existe)
        {
            _context.Correos.Add(new Correo
            {
                Correo1 = correo,
                UsuarioId = run
            });
        }
    }

    // Guardar los cambios
    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
        when (ex.InnerException is PostgresException pg &&
              pg.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        return ConflictMsg(
            "Uno o más correos ya están registrados."
        );
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail(
                "No se pudieron actualizar los correos."
            )
        );
    }

    return await ObtenerPerfil();
}
[HttpPut("password")]
public async Task<IActionResult> CambiarClave(
    [FromBody] CambiarClaveRequest request)
{
    // Validar los datos ingresados
    var errores = PerfilValidator.ValidarCambioClave(request);

    if (errores.Count > 0)
        return BadReq(
            "Los datos ingresados no son válidos.",
            errores.ToArray()
        );

    // Obtener el RUN desde el token
    string run = CurrentRun;

    // Buscar al usuario
    var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Run == run);

    if (usuario == null)
        return NotFoundMsg("Usuario no encontrado.");

    // Comprobar el límite de BCrypt
    if (System.Text.Encoding.UTF8.GetByteCount(request.Actual) > 72)
        return BadReq("La contraseña actual es incorrecta.");

    // Verificar la contraseña actual
    bool claveValida;

    try
    {
        claveValida = BCrypt.Net.BCrypt.Verify(
            request.Actual,
            usuario.Clave
        );
    }
    catch (BCrypt.Net.SaltParseException)
    {
        return BadReq("No se pudo verificar la contraseña actual.");
    }
    catch (ArgumentException)
    {
        return BadReq("No se pudo verificar la contraseña actual.");
    }
    catch (FormatException)
    {
        return BadReq("No se pudo verificar la contraseña actual.");
    }

    if (!claveValida)
        return BadReq("La contraseña actual es incorrecta.");

    // Generar el hash de la nueva contraseña
    usuario.Clave = BCrypt.Net.BCrypt.HashPassword(request.Nueva);

    // Guardar los cambios
    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail("No se pudo actualizar la contraseña.")
        );
    }

    return Success(
        new { run = usuario.Run },
        "Contraseña actualizada correctamente."
    );
}
}