using LaguitoLibre.API.Data;
using LaguitoLibre.API.DTOs;
using LaguitoLibre.API.Models;
using LaguitoLibre.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

// Ofertas temporales.
//   producto -> oferta + rebaja   (oferta_id, producto_id, precio, activo)
//   servicio -> oferta + descuenta (oferta_id, servicio_id, precio)
// Cada oferta creada desde esta API agrupa exactamente UN bien.
[Route("api")]
public class OfertasController : EmprendedorControllerBase
{
    public OfertasController(AppDbContext db) : base(db)
    {
    }

    // GET /api/me/ofertas
    [HttpGet("me/ofertas")]
    public async Task<IActionResult> MisOfertas()
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var hoy = Fechas.Hoy();

        var deProductos = await Db.Rebaja
            .AsNoTracking()
            .Where(r => r.Producto.EmprendedorId == run)
            .Select(r => new
            {
                r.OfertaId,
                BienId = r.ProductoId,
                r.Producto.Nombre,
                r.Producto.Caracteristicas,
                r.Precio,
                r.Activo,
                r.Oferta.Fechainicio,
                r.Oferta.Fechafin,
            })
            .ToListAsync();

        var deServicios = await Db.Descuenta
            .AsNoTracking()
            .Where(d => d.Servicio.EmprendedorId == run)
            .Select(d => new
            {
                d.OfertaId,
                BienId = d.ServicioId,
                d.Servicio.Nombre,
                d.Servicio.Caracteristicas,
                d.Precio,
                d.Oferta.Fechainicio,
                d.Oferta.Fechafin,
            })
            .ToListAsync();

        var ofertas = deProductos
            .Select(r => Armar(r.OfertaId, "producto", r.BienId, r.Nombre,
                BienJson.Leer<ProductoExtra>(r.Caracteristicas).Precio, r.Precio,
                r.Fechainicio, r.Fechafin, r.Activo, hoy))
            .Concat(deServicios.Select(d => Armar(d.OfertaId, "servicio", d.BienId, d.Nombre,
                BienJson.Leer<ServicioExtra>(d.Caracteristicas).Precio, d.Precio,
                d.Fechainicio, d.Fechafin, true, hoy)))
            .OrderByDescending(o => o.FechaInicio).ThenByDescending(o => o.Id)
            .ToList();

        return Ok(ofertas);
    }

    // POST /api/ofertas
    // cuerpo: { "tipo": "producto", "bienId": 3, "fechaInicio": "2026-11-25", "fechaFin": "2026-12-05", "precioOferta": 15000 }
    [HttpPost("ofertas")]
    public async Task<IActionResult> Crear([FromBody] OfertaEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var hoy = Fechas.Hoy();
        var errores = ValidarFechasYPrecio(datos, hoy, out var inicio, out var fin);

        var tipo = (datos.Tipo ?? "producto").Trim().ToLowerInvariant();
        if (tipo != "producto" && tipo != "servicio")
            errores["tipo"] = new[] { "El tipo debe ser producto o servicio." };

        if (errores.Count > 0) return Invalido(errores);

        int precioNormal;
        if (tipo == "producto")
        {
            var producto = await Db.Producto.AsNoTracking().FirstOrDefaultAsync(p => p.Idbien == datos.BienId);
            if (producto == null) return Problem(detail: "No se encontró el producto seleccionado.", statusCode: 404);
            if (producto.EmprendedorId != run) return Forbid();
            if (!producto.Activo)
                return Problem(detail: "No puedes crear ofertas para un producto inactivo.", statusCode: 409);
            precioNormal = BienJson.Leer<ProductoExtra>(producto.Caracteristicas).Precio;
        }
        else
        {
            var servicio = await Db.Servicio.AsNoTracking().FirstOrDefaultAsync(s => s.Idbien == datos.BienId);
            if (servicio == null) return Problem(detail: "No se encontró el servicio seleccionado.", statusCode: 404);
            if (servicio.EmprendedorId != run) return Forbid();
            if (!servicio.Activo)
                return Problem(detail: "No puedes crear ofertas para un servicio pausado.", statusCode: 409);
            precioNormal = BienJson.Leer<ServicioExtra>(servicio.Caracteristicas).Precio;
        }

        if (datos.PrecioOferta >= precioNormal)
            return Invalido(new Dictionary<string, string[]>
            {
                ["precioOferta"] = new[] { $"El precio de oferta debe ser menor que el precio normal ({precioNormal})." },
            });

        if (await HaySolape(tipo, datos.BienId, inicio, fin, 0))
            return Problem(detail: "Ya existe una oferta que se cruza con esas fechas.", statusCode: 409);

        var oferta = new Oferta { Fechainicio = inicio, Fechafin = fin };
        if (tipo == "producto")
            oferta.Rebaja.Add(new Rebaja { ProductoId = datos.BienId, Precio = datos.PrecioOferta, Activo = true });
        else
            oferta.Descuenta.Add(new Descuenta { ServicioId = datos.BienId, Precio = datos.PrecioOferta });

        Db.Oferta.Add(oferta);
        await Db.SaveChangesAsync();

        var nombre = tipo == "producto"
            ? await Db.Producto.Where(p => p.Idbien == datos.BienId).Select(p => p.Nombre).FirstAsync()
            : await Db.Servicio.Where(s => s.Idbien == datos.BienId).Select(s => s.Nombre).FirstAsync();

        var salida = Armar(oferta.Idoferta, tipo, datos.BienId, nombre, precioNormal, datos.PrecioOferta, inicio, fin, true, hoy);
        return Created($"/api/ofertas/{oferta.Idoferta}", salida);
    }

    // PUT /api/ofertas/{id}     cuerpo: { "fechaInicio", "fechaFin", "precioOferta" }  (el bien no se puede cambiar)
    [HttpPut("ofertas/{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] OfertaEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var oferta = await CargarOferta(id);
        if (oferta == null) return Problem(detail: "No se encontró la oferta que deseas editar.", statusCode: 404);

        if (oferta.Rebaja.Count + oferta.Descuenta.Count != 1)
            return Problem(detail: "Esta oferta agrupa varios bienes y no se puede editar desde aquí.", statusCode: 409);

        var rebaja = oferta.Rebaja.FirstOrDefault();
        var descuenta = oferta.Descuenta.FirstOrDefault();
        var duenio = rebaja != null ? rebaja.Producto.EmprendedorId : descuenta!.Servicio.EmprendedorId;
        if (duenio != run) return Forbid();

        var hoy = Fechas.Hoy();
        if (oferta.Fechafin < hoy)
            return Problem(detail: "Una oferta finalizada no se puede modificar.", statusCode: 409);

        var errores = ValidarFechasYPrecio(datos, hoy, out var inicio, out var fin);
        if (errores.Count > 0) return Invalido(errores);

        var tipo = rebaja != null ? "producto" : "servicio";
        var bienId = rebaja != null ? rebaja.ProductoId : descuenta!.ServicioId;
        var nombre = rebaja != null ? rebaja.Producto.Nombre : descuenta!.Servicio.Nombre;
        var precioNormal = rebaja != null
            ? BienJson.Leer<ProductoExtra>(rebaja.Producto.Caracteristicas).Precio
            : BienJson.Leer<ServicioExtra>(descuenta!.Servicio.Caracteristicas).Precio;

        if (datos.PrecioOferta >= precioNormal)
            return Invalido(new Dictionary<string, string[]>
            {
                ["precioOferta"] = new[] { $"El precio de oferta debe ser menor que el precio normal ({precioNormal})." },
            });

        if (await HaySolape(tipo, bienId, inicio, fin, id))
            return Problem(detail: "Ya existe otra oferta que se cruza con esas fechas.", statusCode: 409);

        oferta.Fechainicio = inicio;
        oferta.Fechafin = fin;
        if (rebaja != null) rebaja.Precio = datos.PrecioOferta;
        if (descuenta != null) descuenta.Precio = datos.PrecioOferta;
        await Db.SaveChangesAsync();

        var activa = rebaja?.Activo ?? true;
        return Ok(Armar(id, tipo, bienId, nombre, precioNormal, datos.PrecioOferta, inicio, fin, activa, hoy));
    }

    // DELETE /api/ofertas/{id}
    [HttpDelete("ofertas/{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var oferta = await CargarOferta(id);
        if (oferta == null) return Problem(detail: "No se encontró la oferta.", statusCode: 404);

        var totalItems = oferta.Rebaja.Count + oferta.Descuenta.Count;
        var todoEsMio =
            oferta.Rebaja.All(r => r.Producto.EmprendedorId == run) &&
            oferta.Descuenta.All(d => d.Servicio.EmprendedorId == run);
        if (totalItems == 0 || !todoEsMio) return Forbid();

        Db.Rebaja.RemoveRange(oferta.Rebaja);
        Db.Descuenta.RemoveRange(oferta.Descuenta);
        Db.Oferta.Remove(oferta);
        await Db.SaveChangesAsync();
        return NoContent();
    }

    // ---------------------------------------------------------------------

    private Task<Oferta?> CargarOferta(int id) =>
        Db.Oferta
            .Include(o => o.Rebaja).ThenInclude(r => r.Producto)
            .Include(o => o.Descuenta).ThenInclude(d => d.Servicio)
            .AsSplitQuery()
            .FirstOrDefaultAsync(o => o.Idoferta == id);

    // ¿El bien ya tiene otra oferta cuyo rango de fechas se cruza con [inicio, fin]?
    // excluirOferta = 0 al crear; el id de la oferta al editarla.
    private Task<bool> HaySolape(string tipo, int bienId, DateOnly inicio, DateOnly fin, int excluirOferta) =>
        tipo == "producto"
            ? Db.Rebaja.AnyAsync(r =>
                r.ProductoId == bienId && r.Activo && r.OfertaId != excluirOferta &&
                r.Oferta.Fechainicio <= fin && r.Oferta.Fechafin >= inicio)
            : Db.Descuenta.AnyAsync(d =>
                d.ServicioId == bienId && d.OfertaId != excluirOferta &&
                d.Oferta.Fechainicio <= fin && d.Oferta.Fechafin >= inicio);

    private static Dictionary<string, string[]> ValidarFechasYPrecio(
        OfertaEntrada d, DateOnly hoy, out DateOnly inicio, out DateOnly fin)
    {
        var e = new Dictionary<string, string[]>();

        var okInicio = Fechas.TryLeer(d.FechaInicio, out inicio);
        var okFin = Fechas.TryLeer(d.FechaFin, out fin);

        if (!okInicio)
            e["fechaInicio"] = new[] { "La fecha de inicio es obligatoria (aaaa-mm-dd, año de 4 dígitos)." };
        if (!okFin)
            e["fechaFin"] = new[] { "La fecha de término es obligatoria (aaaa-mm-dd, año de 4 dígitos)." };

        if (okInicio && okFin && fin < inicio)
            e["fechaFin"] = new[] { "La fecha de término no puede ser anterior al inicio." };
        else if (okFin && fin < hoy)
            e["fechaFin"] = new[] { "La fecha de término no puede estar en el pasado." };

        if (d.PrecioOferta <= 0)
            e["precioOferta"] = new[] { "El precio de oferta debe ser mayor que cero." };

        return e;
    }

    private static OfertaSalida Armar(
        int id, string tipo, int bienId, string nombre, int precioNormal, int precioOferta,
        DateOnly inicio, DateOnly fin, bool activa, DateOnly hoy) => new()
    {
        Id = id,
        Tipo = tipo,
        BienId = bienId,
        BienNombre = nombre,
        PrecioNormal = precioNormal,
        PrecioOferta = precioOferta,
        DescuentoPorcentaje = precioNormal > 0
            ? (int)Math.Round((1.0 - (double)precioOferta / precioNormal) * 100)
            : 0,
        FechaInicio = Fechas.Texto(inicio),
        FechaFin = Fechas.Texto(fin),
        EstadoOferta = Fechas.EstadoOferta(inicio, fin, activa, hoy),
    };
}
