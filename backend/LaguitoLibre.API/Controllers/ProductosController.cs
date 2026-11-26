using LaguitoLibre.API.Data;
using LaguitoLibre.API.DTOs;
using LaguitoLibre.API.Models;
using LaguitoLibre.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

// "Mis productos" con variantes.
//   variante = fila de inventario (inventario.nombre) + stock en contiene (inventario_id, producto_id)
//   precio, fotos, envío, tipo de variante y SKU -> columna producto.caracteristicas (jsonb)
[Route("api")]
public class ProductosController : EmprendedorControllerBase
{
    private const int MaxNombre = 50;         // producto.nombre varchar(50)
    private const int MaxDescripcion = 100;   // límite del formulario (la columna admite 500)
    private const int MaxTipoVariante = 20;
    private const int MaxEtiqueta = 30;       // inventario.nombre varchar(30)
    private const int MaxSku = 30;
    private const int MaxFotos = 5;
    private const int MaxLargoFoto = 2000;
    private const int MaxStock = 99999;

    public ProductosController(AppDbContext db) : base(db)
    {
    }

    // GET /api/me/products
    [HttpGet("me/products")]
    public async Task<IActionResult> MisProductos()
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var productos = await ConDetalle()
            .AsNoTracking()
            .Where(p => p.EmprendedorId == run)
            .OrderByDescending(p => p.Idbien)
            .ToListAsync();

        var hoy = Fechas.Hoy();
        return Ok(productos.Select(p => Mapear(p, hoy)).ToList());
    }

    // GET /api/products/{id}   (público; un producto inactivo solo lo ve su dueño)
    [AllowAnonymous]
    [HttpGet("products/{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var producto = await ConDetalle()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Idbien == id);

        if (producto == null || (!producto.Activo && producto.EmprendedorId != RunActual))
            return Problem(detail: "Producto no encontrado.", statusCode: 404);

        return Ok(Mapear(producto, Fechas.Hoy()));
    }

    // POST /api/products
    [HttpPost("products")]
    public async Task<IActionResult> Crear([FromBody] ProductoEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var errores = Validar(datos);
        var categoria = await BuscarCategoria(datos.Categoria);
        if (categoria == null && !errores.ContainsKey("categoria"))
            errores["categoria"] = new[] { "La categoría no existe." };
        if (errores.Count > 0) return Invalido(errores);

        await using var tx = await Db.Database.BeginTransactionAsync();

        var producto = new Producto
        {
            Nombre = datos.Nombre!.Trim(),
            Descripcion = datos.Descripcion!.Trim(),
            Restriccionedad = datos.RestriccionEdad,
            EmprendedorId = run,
            Fechainicio = Fechas.Hoy(),
            Fechafin = null,
            Caracteristicas = "{}",
            Activo = datos.Activo,
        };
        producto.Categoria.Add(categoria!);

        var nuevos = new List<(Inventario Inv, string Sku)>();
        foreach (var v in datos.Variantes!)
        {
            var inv = new Inventario { Nombre = (v.Etiqueta ?? "").Trim() };
            producto.Contiene.Add(new Contiene { Inventario = inv, Stock = v.Stock });
            nuevos.Add((inv, (v.Sku ?? "").Trim()));
        }

        Db.Producto.Add(producto);
        await Db.SaveChangesAsync(); // aquí se generan los ids de producto e inventario

        var skus = new Dictionary<string, string>();
        foreach (var n in nuevos)
        {
            if (n.Sku.Length > 0) skus[n.Inv.Idinventario.ToString()] = n.Sku;
        }

        producto.Caracteristicas = BienJson.Escribir(ConstruirExtra(datos, skus));
        await Db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Obtener), new { id = producto.Idbien }, Mapear(producto, Fechas.Hoy()));
    }

    // PUT /api/products/{id}
    [HttpPut("products/{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ProductoEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var producto = await ConDetalle().FirstOrDefaultAsync(p => p.Idbien == id);
        if (producto == null) return Problem(detail: "Producto no encontrado.", statusCode: 404);
        if (producto.EmprendedorId != run) return Forbid();

        var hoy = Fechas.Hoy();
        var errores = Validar(datos);
        var categoria = await BuscarCategoria(datos.Categoria);
        if (categoria == null && !errores.ContainsKey("categoria"))
            errores["categoria"] = new[] { "La categoría no existe." };

        // Una oferta vigente o futura debe seguir siendo más barata que el precio normal.
        if (producto.Rebaja.Any(r => r.Activo && r.Oferta.Fechafin >= hoy && r.Precio >= datos.Precio))
            errores["precio"] = new[] { "El precio debe ser mayor que el de la oferta vigente o programada." };

        if (errores.Count > 0) return Invalido(errores);

        await using var tx = await Db.Database.BeginTransactionAsync();

        producto.Nombre = datos.Nombre!.Trim();
        producto.Descripcion = datos.Descripcion!.Trim();
        producto.Restriccionedad = datos.RestriccionEdad;
        producto.Activo = datos.Activo;

        if (!producto.Categoria.Any(c => c.Idcategoria == categoria!.Idcategoria))
        {
            producto.Categoria.Clear();
            producto.Categoria.Add(categoria!);
        }

        // Variantes: las que traen id numérico del producto se actualizan, las demás se crean
        // y las que ya no vienen se eliminan.
        var existentes = producto.Contiene.ToDictionary(c => c.InventarioId);
        var conservados = new HashSet<int>();
        var skus = new Dictionary<string, string>();
        var nuevos = new List<(Inventario Inv, string Sku)>();

        foreach (var v in datos.Variantes!)
        {
            var etiqueta = (v.Etiqueta ?? "").Trim();
            var sku = (v.Sku ?? "").Trim();

            if (int.TryParse(v.Id, out var idInv) && existentes.TryGetValue(idInv, out var cont) && conservados.Add(idInv))
            {
                cont.Stock = v.Stock;
                cont.Inventario.Nombre = etiqueta;
                if (sku.Length > 0) skus[idInv.ToString()] = sku;
            }
            else
            {
                var inv = new Inventario { Nombre = etiqueta };
                producto.Contiene.Add(new Contiene { Inventario = inv, Stock = v.Stock });
                nuevos.Add((inv, sku));
            }
        }

        var quitar = existentes.Values.Where(c => !conservados.Contains(c.InventarioId)).ToList();
        var idsQuitar = quitar.Select(c => c.InventarioId).ToList();
        if (idsQuitar.Count > 0)
        {
            // Un carrito que apunta a una variante eliminada ya no tiene sentido.
            await Db.Carrito
                .Where(ci => ci.ProductoId == id && idsQuitar.Contains(ci.InventarioId))
                .ExecuteDeleteAsync();
            Db.Contiene.RemoveRange(quitar);
        }

        await Db.SaveChangesAsync();

        if (idsQuitar.Count > 0)
        {
            // Borra el inventario solo si ningún otro producto lo usa.
            await Db.Inventario
                .Where(i => idsQuitar.Contains(i.Idinventario) && !i.Contiene.Any())
                .ExecuteDeleteAsync();
        }

        foreach (var n in nuevos)
        {
            if (n.Sku.Length > 0) skus[n.Inv.Idinventario.ToString()] = n.Sku;
        }

        producto.Caracteristicas = BienJson.Escribir(ConstruirExtra(datos, skus));
        await Db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(Mapear(producto, hoy));
    }

    // DELETE /api/products/{id}
    [HttpDelete("products/{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var producto = await Db.Producto
            .Include(p => p.Contiene).ThenInclude(c => c.Carrito)
            .Include(p => p.Rebaja)
            .Include(p => p.Consulta)
            .Include(p => p.Categoria)
            .Include(p => p.Cliente)
            .Include(p => p.Cotizacion)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Idbien == id);

        if (producto == null) return Problem(detail: "Producto no encontrado.", statusCode: 404);
        if (producto.EmprendedorId != run) return Forbid();

        var tieneHistorial =
            await Db.Compra.AnyAsync(c => c.ProductoId == id) ||
            await Db.Devuelve.AnyAsync(d => d.ProductoId == id) ||
            await Db.Produce.AnyAsync(p => p.ProductoId == id);

        if (tieneHistorial)
            return Problem(
                detail: "El producto tiene ventas, devoluciones o reseñas asociadas. Desactívalo en lugar de eliminarlo.",
                statusCode: 409);

        await using var tx = await Db.Database.BeginTransactionAsync();

        var idsInventario = producto.Contiene.Select(c => c.InventarioId).ToList();
        var idsOferta = producto.Rebaja.Select(r => r.OfertaId).ToList();

        Db.Carrito.RemoveRange(producto.Contiene.SelectMany(c => c.Carrito));
        Db.Contiene.RemoveRange(producto.Contiene);
        Db.Rebaja.RemoveRange(producto.Rebaja);
        Db.Consulta.RemoveRange(producto.Consulta);
        producto.Categoria.Clear();
        producto.Cliente.Clear();
        producto.Cotizacion.Clear();
        Db.Producto.Remove(producto);
        await Db.SaveChangesAsync();

        if (idsInventario.Count > 0)
        {
            await Db.Inventario
                .Where(i => idsInventario.Contains(i.Idinventario) && !i.Contiene.Any())
                .ExecuteDeleteAsync();
        }

        if (idsOferta.Count > 0)
        {
            await Db.Oferta
                .Where(o => idsOferta.Contains(o.Idoferta) && !o.Rebaja.Any() && !o.Descuenta.Any())
                .ExecuteDeleteAsync();
        }

        await tx.CommitAsync();
        return NoContent();
    }

    // ---------------------------------------------------------------------

    private IQueryable<Producto> ConDetalle() =>
        Db.Producto
            .Include(p => p.Categoria)
            .Include(p => p.Contiene).ThenInclude(c => c.Inventario)
            .Include(p => p.Rebaja).ThenInclude(r => r.Oferta)
            .AsSplitQuery();

    private async Task<Categoria?> BuscarCategoria(string? nombre)
    {
        var buscado = nombre?.Trim().ToLower();
        if (string.IsNullOrEmpty(buscado)) return null;
        return await Db.Categoria.FirstOrDefaultAsync(c => c.Nombre.ToLower() == buscado);
    }

    private static ProductoExtra ConstruirExtra(ProductoEntrada d, Dictionary<string, string> skus)
    {
        var extra = new ProductoExtra
        {
            Precio = d.Precio,
            TipoVariante = string.IsNullOrWhiteSpace(d.TipoVariante) ? "Tamaño" : d.TipoVariante.Trim(),
            Fotos = (d.Fotos ?? new List<string>()).Select(f => f.Trim()).ToList(),
            Skus = skus,
        };

        foreach (var par in d.Caracteristicas ?? new Dictionary<string, string>())
            extra.Caracteristicas[par.Key.Trim()] = (par.Value ?? "").Trim();

        var envio = d.Envio ?? new EnvioDto();
        extra.Envio = new EnvioExtra
        {
            RetiroEnTaller = envio.RetiroEnTaller,
            Despacho = envio.Despacho,
            CostoEnvio = envio.Despacho ? envio.CostoEnvio : 0,
            DiasPreparacion = envio.DiasPreparacion,
        };
        return extra;
    }

    private static string SkuDe(ProductoExtra extra, int inventarioId) =>
        extra.Skus.TryGetValue(inventarioId.ToString(), out var sku) ? sku : "";

    private static ProductoSalida Mapear(Producto p, DateOnly hoy)
    {
        var extra = BienJson.Leer<ProductoExtra>(p.Caracteristicas);

        var oferta = p.Rebaja
            .Where(r => r.Activo && r.Oferta.Fechafin >= hoy)
            .OrderBy(r => r.Oferta.Fechainicio)
            .FirstOrDefault();

        return new ProductoSalida
        {
            Id = p.Idbien,
            EmprendedorId = p.EmprendedorId,
            Nombre = p.Nombre,
            Descripcion = p.Descripcion ?? "",
            Categoria = p.Categoria.Select(c => c.Nombre).FirstOrDefault() ?? "",
            Precio = extra.Precio,
            TipoVariante = extra.TipoVariante,
            Variantes = p.Contiene
                .OrderBy(c => c.InventarioId)
                .Select(c => new VarianteSalida
                {
                    Id = c.InventarioId,
                    Etiqueta = c.Inventario.Nombre,
                    Sku = SkuDe(extra, c.InventarioId),
                    Stock = c.Stock,
                })
                .ToList(),
            Fotos = extra.Fotos,
            Caracteristicas = extra.Caracteristicas,
            Envio = new EnvioDto
            {
                RetiroEnTaller = extra.Envio.RetiroEnTaller,
                Despacho = extra.Envio.Despacho,
                CostoEnvio = extra.Envio.CostoEnvio,
                DiasPreparacion = extra.Envio.DiasPreparacion,
            },
            RestriccionEdad = p.Restriccionedad ?? false,
            Activo = p.Activo,
            Oferta = oferta == null
                ? null
                : new OfertaResumen
                {
                    FechaInicio = Fechas.Texto(oferta.Oferta.Fechainicio),
                    FechaFin = Fechas.Texto(oferta.Oferta.Fechafin),
                    PrecioOferta = oferta.Precio,
                    EstadoOferta = Fechas.EstadoOferta(oferta.Oferta.Fechainicio, oferta.Oferta.Fechafin, oferta.Activo, hoy),
                },
        };
    }

    // Mismas reglas del frontend (utils/formularioProducto.js), repetidas aquí porque
    // el backend nunca debe confiar en lo que validó el navegador.
    private static Dictionary<string, string[]> Validar(ProductoEntrada d)
    {
        var e = new Dictionary<string, string[]>();
        void Err(string campo, string mensaje) => e[campo] = new[] { mensaje };

        var nombre = d.Nombre?.Trim() ?? "";
        if (nombre.Length == 0) Err("nombre", "El nombre es obligatorio.");
        else if (nombre.Length > MaxNombre) Err("nombre", $"El nombre puede tener hasta {MaxNombre} caracteres.");

        var descripcion = d.Descripcion?.Trim() ?? "";
        if (descripcion.Length == 0) Err("descripcion", "La descripción es obligatoria.");
        else if (descripcion.Length > MaxDescripcion)
            Err("descripcion", $"La descripción puede tener hasta {MaxDescripcion} caracteres.");

        if (string.IsNullOrWhiteSpace(d.Categoria)) Err("categoria", "Selecciona una categoría.");

        if (d.Precio < 1) Err("precio", "El precio debe ser un número entero mayor que cero.");

        var tipo = d.TipoVariante?.Trim() ?? "";
        if (tipo.Length > MaxTipoVariante)
            Err("tipoVariante", $"El tipo puede tener hasta {MaxTipoVariante} caracteres.");

        var variantes = d.Variantes ?? new List<VarianteEntrada>();
        if (variantes.Count == 0) Err("variantes", "Agrega al menos una variante.");

        var skusVistos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var etiquetasVistas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var i = 0; i < variantes.Count; i++)
        {
            var v = variantes[i];
            var etiqueta = v.Etiqueta?.Trim() ?? "";
            var sku = v.Sku?.Trim() ?? "";

            if (variantes.Count > 1 && etiqueta.Length == 0)
                Err($"variantes[{i}].etiqueta", "Indica el nombre de la variante.");
            else if (etiqueta.Length > MaxEtiqueta)
                Err($"variantes[{i}].etiqueta", $"El nombre de la variante puede tener hasta {MaxEtiqueta} caracteres.");
            else if (variantes.Count > 1 && !etiquetasVistas.Add(etiqueta))
                Err($"variantes[{i}].etiqueta", "Ya existe una variante con ese nombre.");

            if (sku.Length > MaxSku)
                Err($"variantes[{i}].sku", $"El SKU puede tener hasta {MaxSku} caracteres.");
            else if (sku.Length > 0 && !skusVistos.Add(sku))
                Err($"variantes[{i}].sku", "El SKU está repetido en este producto.");

            if (v.Stock < 0 || v.Stock > MaxStock)
                Err($"variantes[{i}].stock", $"El stock debe ser un entero entre 0 y {MaxStock}.");
        }

        var fotos = d.Fotos ?? new List<string>();
        if (fotos.Count > MaxFotos) Err("fotos", $"Solo puedes subir hasta {MaxFotos} fotografías.");
        else if (fotos.Any(f => string.IsNullOrWhiteSpace(f) || f.Trim().Length > MaxLargoFoto))
            Err("fotos", $"Cada foto debe ser una URL de hasta {MaxLargoFoto} caracteres.");

        var caracteristicas = d.Caracteristicas ?? new Dictionary<string, string>();
        if (caracteristicas.Count > 20) Err("caracteristicas", "Hay demasiadas características (máximo 20).");
        else if (caracteristicas.Any(c => c.Key.Trim().Length == 0 || c.Key.Length > 30 || (c.Value ?? "").Length > 200))
            Err("caracteristicas", "Cada característica admite un nombre de hasta 30 y un valor de hasta 200 caracteres.");

        var envio = d.Envio ?? new EnvioDto();
        if (!envio.RetiroEnTaller && !envio.Despacho) Err("envio", "Elige al menos una opción de entrega.");
        if (envio.Despacho && envio.CostoEnvio < 0) Err("envio.costoEnvio", "El costo de envío debe ser un entero desde 0.");
        if (envio.DiasPreparacion < 1) Err("envio.diasPreparacion", "Los días de preparación deben ser un entero desde 1.");

        return e;
    }
}
