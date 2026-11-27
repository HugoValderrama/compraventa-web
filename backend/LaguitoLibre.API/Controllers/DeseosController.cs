using System.Security.Claims;
using System.Text.Json;
using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DeseosController : ControllerBase
{
    private readonly AppDbContext _context;

    public DeseosController(AppDbContext context)
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

    private static string? ExtraerImagen(string? jsonCaracteristicas)
    {
        if (string.IsNullOrWhiteSpace(jsonCaracteristicas)) return null;
        try
        {
            using var doc = JsonDocument.Parse(jsonCaracteristicas);
            var root = doc.RootElement;
            if (root.TryGetProperty("imagen", out var img) && img.ValueKind == JsonValueKind.String)
                return img.GetString();
            if (root.TryGetProperty("imagenes", out var imgs) && imgs.ValueKind == JsonValueKind.Array && imgs.GetArrayLength() > 0)
                return imgs[0].GetString();
        }
        catch { }
        return null;
    }

    // GET: api/deseos
    [HttpGet]
    public async Task<IActionResult> GetMisDeseos()
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "No se pudo identificar el RUN del usuario en el token." });

        var cliente = await _context.Cliente
            .Include(c => c.Producto)
                .ThenInclude(p => p.Emprendedor)
                    .ThenInclude(e => e.Empresa)
            .Include(c => c.Producto)
                .ThenInclude(p => p.Contiene)
            .Include(c => c.Producto)
                .ThenInclude(p => p.Rebaja)
            .Include(c => c.Servicio)
                .ThenInclude(s => s.Emprendedor)
                    .ThenInclude(e => e.Empresa)
            .Include(c => c.Servicio)
                .ThenInclude(s => s.Descuenta)
            .FirstOrDefaultAsync(c => c.UsuarioId == run);

        if (cliente == null)
            return Ok(new List<object>());

        var productos = cliente.Producto.Select(p =>
        {
            var ofertaActiva = p.Rebaja.FirstOrDefault(r => r.Activo);
            return new
            {
                id = $"producto-{p.Idbien}",
                idBien = p.Idbien,
                tipo = "producto",
                nombre = p.Nombre,
                descripcion = p.Descripcion,
                vendedor = p.Emprendedor?.Empresa?.Razonsocial ?? p.EmprendedorId,
                stock = p.Contiene.Sum(c => c.Stock),
                precio = ofertaActiva?.Precio,
                imagen = ExtraerImagen(p.Caracteristicas)
            };
        });

        var servicios = cliente.Servicio.Select(s =>
        {
            var oferta = s.Descuenta.FirstOrDefault();
            return new
            {
                id = $"servicio-{s.Idbien}",
                idBien = s.Idbien,
                tipo = "servicio",
                nombre = s.Nombre,
                descripcion = s.Descripcion,
                vendedor = s.Emprendedor?.Empresa?.Razonsocial ?? s.EmprendedorId,
                stock = (int?)null,
                precio = oferta?.Precio,
                imagen = ExtraerImagen(s.Caracteristicas)
            };
        });

        return Ok(productos.Concat<object>(servicios).ToList());
    }

    // POST: api/deseos/productos/{idBien}
    [HttpPost("productos/{idBien:int}")]
    public async Task<IActionResult> AgregarProductoDeseado(int idBien)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var cliente = await _context.Cliente
            .Include(c => c.Producto)
            .FirstOrDefaultAsync(c => c.UsuarioId == run);

        if (cliente == null)
            return BadRequest(new { mensaje = "El usuario actual no tiene perfil de cliente." });

        var producto = await _context.Producto.FindAsync(idBien);
        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado." });

        if (!cliente.Producto.Any(p => p.Idbien == idBien))
        {
            cliente.Producto.Add(producto);
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Producto guardado en la lista de deseos." });
    }

    // DELETE: api/deseos/productos/{idBien}
    [HttpDelete("productos/{idBien:int}")]
    public async Task<IActionResult> QuitarProductoDeseado(int idBien)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var cliente = await _context.Cliente
            .Include(c => c.Producto)
            .FirstOrDefaultAsync(c => c.UsuarioId == run);

        if (cliente == null)
            return NotFound(new { mensaje = "Cliente no encontrado." });

        var producto = cliente.Producto.FirstOrDefault(p => p.Idbien == idBien);
        if (producto != null)
        {
            cliente.Producto.Remove(producto);
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Producto eliminado de la lista de deseos." });
    }

    // POST: api/deseos/servicios/{idBien}
    [HttpPost("servicios/{idBien:int}")]
    public async Task<IActionResult> AgregarServicioQuerido(int idBien)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var cliente = await _context.Cliente
            .Include(c => c.Servicio)
            .FirstOrDefaultAsync(c => c.UsuarioId == run);

        if (cliente == null)
            return BadRequest(new { mensaje = "El usuario actual no tiene perfil de cliente." });

        var servicio = await _context.Servicio.FindAsync(idBien);
        if (servicio == null)
            return NotFound(new { mensaje = "Servicio no encontrado." });

        if (!cliente.Servicio.Any(s => s.Idbien == idBien))
        {
            cliente.Servicio.Add(servicio);
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Servicio guardado en la lista de deseos." });
    }

    // DELETE: api/deseos/servicios/{idBien}
    [HttpDelete("servicios/{idBien:int}")]
    public async Task<IActionResult> QuitarServicioQuerido(int idBien)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var cliente = await _context.Cliente
            .Include(c => c.Servicio)
            .FirstOrDefaultAsync(c => c.UsuarioId == run);

        if (cliente == null)
            return NotFound(new { mensaje = "Cliente no encontrado." });

        var servicio = cliente.Servicio.FirstOrDefault(s => s.Idbien == idBien);
        if (servicio != null)
        {
            cliente.Servicio.Remove(servicio);
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Servicio eliminado de la lista de deseos." });
    }
}
