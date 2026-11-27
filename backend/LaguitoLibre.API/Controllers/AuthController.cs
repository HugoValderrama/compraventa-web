using LaguitoLibre.API.Models;
using Npgsql;
using LaguitoLibre.API.Common;
using LaguitoLibre.API.Data;
using LaguitoLibre.API.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Text;

namespace LaguitoLibre.API.Controllers;

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
        string run = request.Run.Trim().Replace(".", "").ToUpperInvariant();
        string correo = request.Correo.Trim().ToLowerInvariant();
        int telefono = int.Parse("9" + request.Telefono);

        // Comprobar RUN duplicado
        if (await _context.Usuario.AnyAsync(u => u.Run == run))
        {
            return ConflictMsg("El RUN ya está registrado.");
        }

        // Comprobar correo duplicado
        if (await _context.Correo.AnyAsync(
            c => c.Correo1.ToLower() == correo))
        {
            return ConflictMsg("El correo ya está registrado.");
        }

        // Comprobar teléfono duplicado
        if (await _context.Telefono.AnyAsync(
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
_context.Usuario.Add(usuario);
_context.Correo.Add(nuevoCorreo);
_context.Telefono.Add(nuevoTelefono);

// Asignar rol
if (request.Rol == "Cliente")
{
    var cliente = new Cliente
    {
        UsuarioId = run
    };

    _context.Cliente.Add(cliente);
}
else if (request.Rol == "Emprendedor")
{
    var emprendedor = new Emprendedor
    {
        UsuarioId = run
    };

    _context.Emprendedor.Add(emprendedor);
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

    // Normalizar RUN
    string run = request.Run.Trim().Replace(".", "").ToUpperInvariant();

    // Buscar usuario en PostgreSQL
    var usuario = await _context.Usuario
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
    catch (Exception ex) when (ex is BCrypt.Net.SaltParseException || ex is ArgumentException || ex is FormatException)
    {
        return Unauthorized401("RUN o contraseña incorrectos.");
    }

    if (!claveValida)
    {
        return Unauthorized401("RUN o contraseña incorrectos.");
    }

    // Detectar rol automáticamente desde las tablas Cliente y Emprendedor
    bool esEmprendedor = await _context.Emprendedor.AnyAsync(e => e.UsuarioId == run);
    bool esCliente = await _context.Cliente.AnyAsync(c => c.UsuarioId == run);

    string? rol = esEmprendedor ? "Emprendedor" : (esCliente ? "Cliente" : null);

    if (rol == null)
    {
        return Forbidden403("El usuario no tiene un rol asignado en el sistema.");
    }

    // Generar token JWT con el rol encontrado
    string token = GenerarToken(usuario.Run, rol);

    // Respuesta exitosa
    return Success(
        new
        {
            run = usuario.Run,
            nombre = usuario.Nombre1,
            apellido = usuario.Apellido1,
            rol = rol,
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
        Encoding.UTF8.GetBytes(jwtKey)
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