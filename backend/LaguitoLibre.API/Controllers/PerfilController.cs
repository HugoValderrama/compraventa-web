using LaguitoLibre.API.Common;
using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LaguitoLibre.API.DTOs.Perfil;
using LaguitoLibre.API.Models;
using Npgsql;

namespace LaguitoLibre.API.Controllers;

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

    var usuario = await _context.Usuario
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

            correo = u.Correo
                .Select(c => c.Correo1)
                .ToList(),

            telefono = u.Telefono
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
    var usuario = await _context.Usuario
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
    bool existeUsuario = await _context.Usuario
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
    bool telefonoOcupado = await _context.Telefono
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
    var telefonosActuales = await _context.Telefono
        .Where(t => t.UsuarioId == run)
        .ToListAsync();

    // Identificar teléfonos que deben eliminarse
    var telefonosEliminar = telefonosActuales
        .Where(t => !nuevosTelefonos.Contains(t.Telefono1))
        .ToList();

    _context.Telefono.RemoveRange(telefonosEliminar);

    // Agregar solamente los teléfonos nuevos
    foreach (int numero in nuevosTelefonos)
    {
        bool existe = telefonosActuales
            .Any(t => t.Telefono1 == numero);

        if (!existe)
        {
            _context.Telefono.Add(new Telefono
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
    bool existeUsuario = await _context.Usuario
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
    bool correoOcupado = await _context.Correo
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
    var correosActuales = await _context.Correo
        .Where(c => c.UsuarioId == run)
        .ToListAsync();

    // Identificar correos que deben eliminarse
    var correosEliminar = correosActuales
        .Where(c => !nuevosCorreos.Contains(c.Correo1))
        .ToList();

    _context.Correo.RemoveRange(correosEliminar);

    // Agregar solamente los correos nuevos
    foreach (string correo in nuevosCorreos)
    {
        bool existe = correosActuales
            .Any(c => c.Correo1 == correo);

        if (!existe)
        {
            _context.Correo.Add(new Correo
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
    var usuario = await _context.Usuario
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
[Authorize(Roles = "Emprendedor")]
[HttpGet("empresa")]
public async Task<IActionResult> ObtenerEmpresa()
{
    string run = CurrentRun;

    var emprendedor = await _context.Emprendedor
        .AsNoTracking()
        .Include(e => e.Empresa)
        .FirstOrDefaultAsync(e => e.UsuarioId == run);

    if (emprendedor == null)
    {
        return NotFoundMsg("Emprendedor no encontrado.");
    }

    if (emprendedor.Empresa == null)
    {
        return Success<object?>(
            null,
            "El emprendedor no tiene una empresa asociada."
        );
    }

    var empresa = emprendedor.Empresa;

    return Success(new
    {
        rut = empresa.Rut,
        razonSocial = empresa.Razonsocial,
        giro = empresa.Giro,
        paginaWeb = empresa.Paginaweb,
        direccionLocal = empresa.Direccionlocal
    }, "Empresa obtenida correctamente.");
}
[Authorize(Roles = "Emprendedor")]
[HttpPost("empresa")]
public async Task<IActionResult> RegistrarEmpresa(
    [FromBody] RegistrarEmpresaRequest request)
{
    // Validar los datos ingresados
    var errores = PerfilValidator.ValidarRegistroEmpresa(request);

    if (errores.Count > 0)
    {
        return BadReq(
            "Los datos ingresados no son válidos.",
            errores.ToArray()
        );
    }

    string run = CurrentRun;
    string rut = PerfilValidator.NormalizarRutEmpresa(request.Rut);

    // Buscar al emprendedor autenticado
    var emprendedor = await _context.Emprendedor
        .FirstOrDefaultAsync(e => e.UsuarioId == run);

    if (emprendedor == null)
    {
        return NotFoundMsg("Emprendedor no encontrado.");
    }

    // Verificar si ya tiene una empresa
    if (emprendedor.EmpresaId != null)
    {
        return ConflictMsg(
            "El emprendedor ya tiene una empresa asociada."
        );
    }

    // Verificar si el RUT ya está registrado
    bool existeEmpresa = await _context.Empresa
        .AnyAsync(e => e.Rut == rut);

    if (existeEmpresa)
    {
        return ConflictMsg(
            "El RUT de la empresa ya está registrado."
        );
    }

    // Crear la empresa
    var empresa = new Empresa
    {
        Rut = rut,
        Razonsocial = request.RazonSocial.Trim(),
        Giro = request.Giro.Trim(),

        Paginaweb = string.IsNullOrWhiteSpace(request.PaginaWeb)
            ? null
            : request.PaginaWeb.Trim(),

        Direccionlocal = string.IsNullOrWhiteSpace(request.DireccionLocal)
            ? null
            : request.DireccionLocal.Trim()
    };

    // Registrar y asociar la empresa
    _context.Empresa.Add(empresa);
    emprendedor.EmpresaId = empresa.Rut;

    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException ex)
        when (ex.InnerException is PostgresException pg &&
              pg.SqlState == PostgresErrorCodes.UniqueViolation)
    {
        return ConflictMsg("La empresa ya está registrada.");
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail("No se pudo registrar la empresa.")
        );
    }

    return CreatedOk(new
    {
        rut = empresa.Rut,
        razonSocial = empresa.Razonsocial,
        giro = empresa.Giro,
        paginaWeb = empresa.Paginaweb,
        direccionLocal = empresa.Direccionlocal
    }, "Empresa registrada correctamente.");
}
[Authorize(Roles = "Emprendedor")]
[HttpPut("empresa")]
public async Task<IActionResult> ActualizarEmpresa(
    [FromBody] ActualizarEmpresaRequest request)
{
    // Validar los datos ingresados
    var errores = PerfilValidator.ValidarActualizacionEmpresa(request);

    if (errores.Count > 0)
    {
        return BadReq(
            "Los datos ingresados no son válidos.",
            errores.ToArray()
        );
    }

    string run = CurrentRun;

    // Buscar al emprendedor y su empresa
    var emprendedor = await _context.Emprendedor
        .Include(e => e.Empresa)
        .FirstOrDefaultAsync(e => e.UsuarioId == run);

    if (emprendedor == null)
    {
        return NotFoundMsg("Emprendedor no encontrado.");
    }

    if (emprendedor.Empresa == null)
    {
        return NotFoundMsg(
            "El emprendedor no tiene una empresa asociada."
        );
    }

    var empresa = emprendedor.Empresa;

    // Impedir la modificación del RUT
    string rut = PerfilValidator.NormalizarRutEmpresa(request.Rut);

    if (rut != empresa.Rut)
    {
        return BadReq("No se permite modificar el RUT de la empresa.");
    }

    // Comprobar si la empresa está compartida
    bool empresaCompartida = await _context.Emprendedor
        .AnyAsync(e => e.EmpresaId == empresa.Rut &&
                       e.UsuarioId != run);

    if (empresaCompartida)
    {
        return Forbidden403(
            "No se permite modificar una empresa compartida."
        );
    }

    // Actualizar los datos
    empresa.Razonsocial = request.RazonSocial.Trim();
    empresa.Giro = request.Giro.Trim();

    empresa.Paginaweb = string.IsNullOrWhiteSpace(request.PaginaWeb)
        ? null
        : request.PaginaWeb.Trim();

    empresa.Direccionlocal = string.IsNullOrWhiteSpace(request.DireccionLocal)
        ? null
        : request.DireccionLocal.Trim();

    try
    {
        await _context.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
        return StatusCode(
            500,
            ApiResponse.Fail("No se pudo actualizar la empresa.")
        );
    }

    return Success(new
    {
        rut = empresa.Rut,
        razonSocial = empresa.Razonsocial,
        giro = empresa.Giro,
        paginaWeb = empresa.Paginaweb,
        direccionLocal = empresa.Direccionlocal
    }, "Empresa actualizada correctamente.");
}
}