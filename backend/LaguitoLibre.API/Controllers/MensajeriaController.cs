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
public class MensajeriaController : ControllerBase
{
    private readonly AppDbContext _context;

    public MensajeriaController(AppDbContext context)
    {
        _context = context;
    }

    public record EnviarMensajeDto(string Texto);

    private string? ObtenerRunUsuario()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue("run")
            ?? User.FindFirstValue("Run");
    }

    private static string FormatearNombreUsuario(Usuario? u, string fallback)
    {
        if (u == null) return fallback;
        var nombre = $"{u.Nombre1} {u.Apellido1}".Trim();
        return string.IsNullOrEmpty(nombre) ? fallback : nombre;
    }

    // GET: api/mensajeria
    [HttpGet]
    public async Task<IActionResult> GetConversaciones()
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "No se pudo identificar el RUN del usuario en el token." });

        // Ventas donde el usuario participa como cliente (Compra o Adquiere), como emprendedor (Producto o Servicio) o ya tiene mensajes en Interactua
        var ventas = await _context.Venta
            .Include(v => v.Compra)
                .ThenInclude(c => c.Cliente)
                    .ThenInclude(cl => cl.Usuario)
            .Include(v => v.Compra)
                .ThenInclude(c => c.Producto)
                    .ThenInclude(p => p.Emprendedor)
                        .ThenInclude(e => e.Usuario)
            .Include(v => v.Compra)
                .ThenInclude(c => c.Producto)
                    .ThenInclude(p => p.Emprendedor)
                        .ThenInclude(e => e.Empresa)
            .Include(v => v.Adquiere)
                .ThenInclude(a => a.Cliente)
                    .ThenInclude(cl => cl.Usuario)
            .Include(v => v.Adquiere)
                .ThenInclude(a => a.Servicio)
                    .ThenInclude(s => s.Emprendedor)
                        .ThenInclude(e => e.Usuario)
            .Include(v => v.Adquiere)
                .ThenInclude(a => a.Servicio)
                    .ThenInclude(s => s.Emprendedor)
                        .ThenInclude(e => e.Empresa)
            .Include(v => v.Interactua)
                .ThenInclude(i => i.Mensaje)
            .Include(v => v.Interactua)
                .ThenInclude(i => i.Usuario)
            .Where(v =>
                v.Compra.Any(c => c.ClienteId == run || c.Producto.EmprendedorId == run) ||
                v.Adquiere.Any(a => a.ClienteId == run || a.Servicio.EmprendedorId == run) ||
                v.Interactua.Any(i => i.UsuarioId == run))
            .ToListAsync();

        var resultado = new List<object>();

        foreach (var v in ventas)
        {
            var compra = v.Compra.FirstOrDefault();
            var adquiere = v.Adquiere.FirstOrDefault();

            string? clienteRun = compra?.ClienteId ?? adquiere?.ClienteId;
            Usuario? clienteUsuario = compra?.Cliente?.Usuario ?? adquiere?.Cliente?.Usuario;

            Emprendedor? emprendedor = compra?.Producto?.Emprendedor ?? adquiere?.Servicio?.Emprendedor;
            string? emprendedorRun = emprendedor?.UsuarioId;

            bool soyCliente = clienteRun == run;
            bool soyEmprendedor = emprendedorRun == run;

            string contactoNombre;
            string contactoRol;

            if (soyCliente)
            {
                contactoRol = "emprendedor";
                contactoNombre = emprendedor?.Empresa?.Razonsocial
                    ?? FormatearNombreUsuario(emprendedor?.Usuario, $"Emprendedor (Pedido #{v.Idventa})");
            }
            else if (soyEmprendedor)
            {
                contactoRol = "cliente";
                contactoNombre = FormatearNombreUsuario(clienteUsuario, $"Cliente (Pedido #{v.Idventa})");
            }
            else
            {
                var otro = v.Interactua.FirstOrDefault(i => i.UsuarioId != run)?.Usuario;
                contactoRol = "cliente";
                contactoNombre = FormatearNombreUsuario(otro, $"Pedido #{v.Idventa}");
            }

            var mensajesOrdenados = v.Interactua
                .OrderBy(i => i.Mensaje.Fechaenvio)
                .ThenBy(i => i.MensajeId)
                .Select(i => new
                {
                    id = $"msg-{i.MensajeId}",
                    mensajeId = i.MensajeId,
                    autor = i.UsuarioId == run ? "yo" : "contacto",
                    texto = i.Mensaje.Contenido,
                    fecha = DateTime.SpecifyKind(i.Mensaje.Fechaenvio, DateTimeKind.Local).ToUniversalTime().ToString("O"),
                    leido = i.Mensaje.Leido
                })
                .ToList();

            var ultimoLeidoContacto = mensajesOrdenados
                .LastOrDefault(m => m.autor == "contacto" && m.leido);

            var ultimoMensaje = mensajesOrdenados.LastOrDefault();
            string? leidoHasta = ultimoMensaje?.autor == "yo"
                ? ultimoMensaje.id
                : ultimoLeidoContacto?.id;

            resultado.Add(new
            {
                id = $"venta-{v.Idventa}",
                ventaId = v.Idventa,
                contacto = new
                {
                    nombre = $"{contactoNombre} · Pedido #{v.Idventa}",
                    rol = contactoRol
                },
                leidoHasta,
                mensajes = mensajesOrdenados
            });
        }

        return Ok(resultado);
    }

    // POST: api/mensajeria/ventas/{ventaId}/mensajes
    [HttpPost("ventas/{ventaId:int}/mensajes")]
    public async Task<IActionResult> EnviarMensaje(int ventaId, [FromBody] EnviarMensajeDto dto)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var texto = dto?.Texto?.Trim() ?? "";
        if (string.IsNullOrEmpty(texto))
            return BadRequest(new { mensaje = "Escribe un mensaje antes de enviarlo." });

        if (texto.Length > 500)
            return BadRequest(new { mensaje = "El mensaje puede tener hasta 500 caracteres." });

        var venta = await _context.Venta
            .Include(v => v.Compra).ThenInclude(c => c.Producto)
            .Include(v => v.Adquiere).ThenInclude(a => a.Servicio)
            .Include(v => v.Interactua)
            .FirstOrDefaultAsync(v => v.Idventa == ventaId);

        if (venta == null)
            return NotFound(new { mensaje = "La venta indicada no existe." });

        bool participa =
            venta.Compra.Any(c => c.ClienteId == run || c.Producto.EmprendedorId == run) ||
            venta.Adquiere.Any(a => a.ClienteId == run || a.Servicio.EmprendedorId == run) ||
            venta.Interactua.Any(i => i.UsuarioId == run);

        if (!participa)
            return Forbid();

        var ahoraLocal = DateTime.Now;
        var nuevoMensaje = new Mensaje
        {
            Contenido = texto,
            Fechaenvio = DateTime.SpecifyKind(ahoraLocal, DateTimeKind.Unspecified),
            Leido = false
        };

        _context.Mensaje.Add(nuevoMensaje);
        await _context.SaveChangesAsync();

        var interaccion = new Interactua
        {
            UsuarioId = run,
            MensajeId = nuevoMensaje.Idmensaje,
            VentaId = ventaId
        };

        _context.Interactua.Add(interaccion);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = $"msg-{nuevoMensaje.Idmensaje}",
            mensajeId = nuevoMensaje.Idmensaje,
            autor = "yo",
            texto = nuevoMensaje.Contenido,
            fecha = DateTime.SpecifyKind(nuevoMensaje.Fechaenvio, DateTimeKind.Local).ToUniversalTime().ToString("O"),
            leido = nuevoMensaje.Leido
        });
    }

    // PUT: api/mensajeria/ventas/{ventaId}/leer
    [HttpPut("ventas/{ventaId:int}/leer")]
    public async Task<IActionResult> MarcarLeida(int ventaId)
    {
        var run = ObtenerRunUsuario();
        if (string.IsNullOrEmpty(run))
            return Unauthorized(new { mensaje = "Token inválido." });

        var mensajesNoLeidos = await _context.Interactua
            .Include(i => i.Mensaje)
            .Where(i => i.VentaId == ventaId && i.UsuarioId != run && !i.Mensaje.Leido)
            .Select(i => i.Mensaje)
            .ToListAsync();

        if (mensajesNoLeidos.Count > 0)
        {
            foreach (var msg in mensajesNoLeidos)
            {
                msg.Leido = true;
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new { actualizados = mensajesNoLeidos.Count });
    }
}
