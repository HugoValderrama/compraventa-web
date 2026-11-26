using LaguitoLibre.Api.Models;
using Npgsql;
using LaguitoLibre.Api.Common;
using LaguitoLibre.Api.Data;
using LaguitoLibre.Api.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.Api.Controllers;

[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Registro(
        [FromBody] RegistroRequest request)
    {
        // Validar los datos del registro
        var errores = RegistroValidator.Validar(request);

        if (errores.Count > 0)
        {
            return BadReq(
                "Los datos ingresados no son válidos.",
                errores.ToArray()
            );
        }

        // Comprobar conexión a PostgreSQL
        if (!await _context.Database.CanConnectAsync())
        {
            return StatusCode(
                503,
                ApiResponse.Fail(
                    "No se pudo conectar a la base de datos."
                )
            );
        }

        // Normalizar los datos
        string run = request.Run.Trim().ToUpperInvariant();
        string correo = request.Correo.Trim().ToLowerInvariant();
        int telefono = int.Parse("9" + request.Telefono);

        // Comprobar RUN duplicado
        if (await _context.Usuarios.AnyAsync(u => u.Run == run))
        {
            return ConflictMsg("El RUN ya está registrado.");
        }

        // Comprobar correo duplicado
        if (await _context.Correos.AnyAsync(
            c => c.Correo1.ToLower() == correo))
        {
            return ConflictMsg("El correo ya está registrado.");
        }

        // Comprobar teléfono duplicado
        if (await _context.Telefonos.AnyAsync(
            t => t.Telefono1 == telefono))
        {
            return ConflictMsg("El teléfono ya está registrado.");
        }
// Generar hash seguro de la contraseña
string claveHash = BCrypt.Net.BCrypt.HashPassword(request.Clave);
        // Crear usuario
var usuario = new Usuario
{
    Run = run,
    Nombre1 = request.Nombre1,
    Nombre2 = request.Nombre2,
    Apellido1 = request.Apellido1,
    Apellido2 = request.Apellido2,
    Fechanac = request.Fechanac,
    Fecharegistro = DateOnly.FromDateTime(DateTime.Today),
    Clave = claveHash
};

// Crear correo
var nuevoCorreo = new Correo
{
    Correo1 = correo,
    UsuarioId = run
};

// Crear teléfono
var nuevoTelefono = new Telefono
{
    Telefono1 = telefono,
    UsuarioId = run
};

// Agregar registros al contexto
_context.Usuarios.Add(usuario);
_context.Correos.Add(nuevoCorreo);
_context.Telefonos.Add(nuevoTelefono);

// Asignar rol
if (request.Rol == "Cliente")
{
    var cliente = new Cliente
    {
        UsuarioId = run
    };

    _context.Clientes.Add(cliente);
}
else if (request.Rol == "Emprendedor")
{
    var emprendedor = new Emprendedor
    {
        UsuarioId = run
    };

    _context.Emprendedors.Add(emprendedor);
}

// Guardar todos los registros en PostgreSQL
try
{
    await _context.SaveChangesAsync();
}
catch (DbUpdateException ex) when
    (ex.InnerException is PostgresException pg &&
     pg.SqlState == PostgresErrorCodes.UniqueViolation)
{
    return ConflictMsg(
        "El RUN, correo o teléfono ya está registrado."
    );
}
catch (DbUpdateException)
{
    return StatusCode(
        500,
        ApiResponse.Fail("No se pudo registrar el usuario.")
    );
}

// Respuesta exitosa
return CreatedOk(
    new
    {
        run = usuario.Run,
        nombre = usuario.Nombre1,
        apellido = usuario.Apellido1,
        rol = request.Rol
    },
    "Usuario registrado correctamente."
);
    }
}