using LaguitoLibre.Api.Models;
using Npgsql;
using LaguitoLibre.Api.Common;
using LaguitoLibre.Api.Data;
using LaguitoLibre.Api.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace LaguitoLibre.Api.Controllers;

[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly AppDbContext _context;
private readonly IConfiguration _configuration;

public AuthController(
    AppDbContext context,
    IConfiguration configuration)
{
    _context = context;
    _configuration = configuration;
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
[HttpPost("login")]
public async Task<IActionResult> Login(
    [FromBody] LoginRequest request)
{
    // Validar RUN
    if (!RunValidator.EsValido(request.Run))
    {
        return BadReq("El RUN ingresado no es válido.");
    }

    // Validar contraseña
    if (string.IsNullOrWhiteSpace(request.Clave))
    {
        return BadReq("Debes ingresar una contraseña.");
    }

    // Validar rol
    if (request.Rol != "Cliente" &&
        request.Rol != "Emprendedor")
    {
        return BadReq("El rol seleccionado no es válido.");
    }

    // Normalizar RUN
    string run = request.Run.Trim().ToUpperInvariant();

    // Buscar usuario en PostgreSQL
    var usuario = await _context.Usuarios
        .AsNoTracking()
        .FirstOrDefaultAsync(u => u.Run == run);

    if (usuario == null)
    {
        return Unauthorized401("RUN o contraseña incorrectos.");
    }

    // Verificar contraseña mediante BCrypt
bool claveValida;

try
{
    claveValida = BCrypt.Net.BCrypt.Verify(
        request.Clave,
        usuario.Clave
    );
}
catch (BCrypt.Net.SaltParseException)
{
    return Unauthorized401("RUN o contraseña incorrectos.");
}
catch (ArgumentException)
{
    return Unauthorized401("RUN o contraseña incorrectos.");
}
catch (FormatException)
{
    return Unauthorized401("RUN o contraseña incorrectos.");
}

if (!claveValida)
{
    return Unauthorized401("RUN o contraseña incorrectos.");
}

    // Comprobar rol Cliente
    if (request.Rol == "Cliente")
    {
        bool esCliente = await _context.Clientes
            .AnyAsync(c => c.UsuarioId == run);

        if (!esCliente)
        {
            return Forbidden403(
                "El usuario no posee el rol de Cliente."
            );
        }
    }

    // Comprobar rol Emprendedor
    if (request.Rol == "Emprendedor")
    {
        bool esEmprendedor = await _context.Emprendedors
            .AnyAsync(e => e.UsuarioId == run);

        if (!esEmprendedor)
        {
            return Forbidden403(
                "El usuario no posee el rol de Emprendedor."
            );
        }
    }

    // Generar token JWT
string token = GenerarToken(usuario.Run, request.Rol);

// Respuesta exitosa
return Success(
    new
    {
        run = usuario.Run,
        nombre = usuario.Nombre1,
        apellido = usuario.Apellido1,
        rol = request.Rol,
        token = token
    },
    "Inicio de sesión exitoso."
);
}
private string GenerarToken(string run, string rol)
{
    var jwtKey = _configuration["Jwt:Key"]
        ?? throw new InvalidOperationException(
            "No se ha configurado la clave JWT."
        );

    var key = new SymmetricSecurityKey(
        Convert.FromBase64String(jwtKey)
    );

    var credenciales = new SigningCredentials(
        key,
        SecurityAlgorithms.HmacSha256
    );

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, run),
        new Claim(ClaimTypes.Role, rol),
        new Claim(
            JwtRegisteredClaimNames.Jti,
            Guid.NewGuid().ToString()
        )
    };

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(
            _configuration.GetValue<int>("Jwt:ExpiraMinutos")
        ),
        signingCredentials: credenciales
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
[Authorize]
[HttpGet("verificar")]
public IActionResult VerificarToken()

{
    return Success(
        new
        {
            run = CurrentRun,
            rol = User.FindFirstValue(ClaimTypes.Role)
        },
        "Token válido."
    );
} 
[Authorize(Roles = "Emprendedor")]
[HttpGet("verificar-emprendedor")]
public IActionResult VerificarEmprendedor()
{
    return Success(
        new
        {
            run = CurrentRun,
            rol = User.FindFirstValue(ClaimTypes.Role)
        },
        "Acceso autorizado como emprendedor."
    );
}   
}