using System.Security.Claims;
using LaguitoLibre.API.Data;
using LaguitoLibre.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DireccionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DireccionesController(AppDbContext context)
    {
        _context = context;
    }

    private string? ObtenerRunUsuario()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("run")
            ?? User.FindFirstValue("Run");
    }

    // GET: api/direcciones
    [HttpGet]
    public async Task<IActionResult> GetMisDirecciones()
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "No se pudo identificar el RUN del usuario en el token." });

        var direcciones = await _context.Direccion
            .Where(d => d.Usuario.Any(u => u.Run == run))
            .Select(d => new
            {
                id = d.Iddireccion,
                calle = d.Calle,
                numero = d.Numero,
                departamento = d.Departamento,
                codigoPostal = d.Codigopostal,
                comunaId = d.CodigopostalNavigation.Comuna.Id,
                comuna = d.CodigopostalNavigation.Comuna.Nombre,
                provinciaId = d.CodigopostalNavigation.Comuna.IdProvinciaNavigation.Id,
                provincia = d.CodigopostalNavigation.Comuna.IdProvinciaNavigation.Nombre,
                regionId = d.CodigopostalNavigation.Comuna.IdProvinciaNavigation.IdRegionNavigation.Id,
                region = d.CodigopostalNavigation.Comuna.IdProvinciaNavigation.IdRegionNavigation.Nombre
            })
            .ToListAsync();

        return Ok(direcciones);
    }

    // POST: api/direcciones
    [HttpPost]
    public async Task<IActionResult> CrearDireccion([FromBody] DireccionRequest request)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var usuario = await _context.Usuario
            .Include(u => u.Direccion)
            .FirstOrDefaultAsync(u => u.Run == run);

        if (usuario == null)
            return NotFound(new { mensaje = "Usuario no encontrado." });

        var comunaExiste = await _context.Comuna.AnyAsync(c => c.Id == request.ComunaId);
        if (!comunaExiste)
            return BadRequest(new { mensaje = "La comuna seleccionada no es válida." });

        // Verifica si el código postal ingresado ya existe en la tabla 'codigopostal'
        var registroCp = await _context.Codigopostal.FirstOrDefaultAsync(cp => cp.Codigopostal1 == request.CodigoPostal);
        if (registroCp == null)
        {
            // Si no existe, lo crea vinculándolo a la comuna seleccionada
            registroCp = new Codigopostal
            {
                Codigopostal1 = request.CodigoPostal,
                ComunaId = request.ComunaId
            };
            _context.Codigopostal.Add(registroCp);
        }
        else if (registroCp.ComunaId != request.ComunaId)
        {
            return BadRequest(new { mensaje = "Ese código postal ya está registrado bajo otra comuna." });
        }

        var nuevaDireccion = new Direccion
        {
            Calle = request.Calle.Trim(),
            Numero = request.Numero,
            Departamento = string.IsNullOrWhiteSpace(request.Departamento) ? null : request.Departamento.Trim(),
            Codigopostal = request.CodigoPostal
        };

        usuario.Direccion.Add(nuevaDireccion);
        await _context.SaveChangesAsync();

        return Ok(new { id = nuevaDireccion.Iddireccion, mensaje = "Dirección guardada correctamente." });
    }

    // PUT: api/direcciones/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> ActualizarDireccion(int id, [FromBody] DireccionRequest request)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var direccion = await _context.Direccion
            .FirstOrDefaultAsync(d => d.Iddireccion == id && d.Usuario.Any(u => u.Run == run));

        if (direccion == null)
            return NotFound(new { mensaje = "Dirección no encontrada." });

        var comunaExiste = await _context.Comuna.AnyAsync(c => c.Id == request.ComunaId);
        if (!comunaExiste)
            return BadRequest(new { mensaje = "La comuna seleccionada no es válida." });

        var registroCp = await _context.Codigopostal.FirstOrDefaultAsync(cp => cp.Codigopostal1 == request.CodigoPostal);
        if (registroCp == null)
        {
            registroCp = new Codigopostal
            {
                Codigopostal1 = request.CodigoPostal,
                ComunaId = request.ComunaId
            };
            _context.Codigopostal.Add(registroCp);
        }
        else if (registroCp.ComunaId != request.ComunaId)
        {
            return BadRequest(new { mensaje = "Ese código postal ya está registrado bajo otra comuna." });
        }

        direccion.Calle = request.Calle.Trim();
        direccion.Numero = request.Numero;
        direccion.Departamento = string.IsNullOrWhiteSpace(request.Departamento) ? null : request.Departamento.Trim();
        direccion.Codigopostal = request.CodigoPostal;

        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Dirección actualizada correctamente." });
    }

    // DELETE: api/direcciones/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> EliminarDireccion(int id)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var usuario = await _context.Usuario
            .Include(u => u.Direccion)
            .FirstOrDefaultAsync(u => u.Run == run);

        if (usuario == null)
            return NotFound();

        var direccion = usuario.Direccion.FirstOrDefault(d => d.Iddireccion == id);
        if (direccion == null)
            return NotFound(new { mensaje = "Dirección no encontrada." });

        usuario.Direccion.Remove(direccion);

        var tieneDespachos = await _context.Despacho.AnyAsync(dp => dp.DireccionId == id);
        if (!tieneDespachos)
        {
            _context.Direccion.Remove(direccion);
        }

        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Dirección eliminada correctamente." });
    }
}


public class DireccionRequest
{
    public string Calle { get; set; } = null!;
    public int Numero { get; set; }
    public string? Departamento { get; set; }
    public int ComunaId { get; set; }
    public int CodigoPostal { get; set; }
}
