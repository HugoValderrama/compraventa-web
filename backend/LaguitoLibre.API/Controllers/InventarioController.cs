using LaguitoLibre.API.Data;
using LaguitoLibre.API.DTOs;
using LaguitoLibre.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

// Inventario del emprendedor: una fila por variante (tabla contiene).
[Route("api")]
public class InventarioController : EmprendedorControllerBase
{
    private const int MaxStock = 99999;

    public InventarioController(AppDbContext db) : base(db)
    {
    }

    // GET /api/me/inventory
    [HttpGet("me/inventory")]
    public async Task<IActionResult> MiInventario()
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var filas = await Db.Contiene
            .AsNoTracking()
            .Where(c => c.Producto.EmprendedorId == run)
            .OrderBy(c => c.Producto.Nombre).ThenBy(c => c.InventarioId)
            .Select(c => new
            {
                c.InventarioId,
                c.ProductoId,
                ProductoNombre = c.Producto.Nombre,
                c.Producto.Caracteristicas,
                c.Producto.Activo,
                Categoria = c.Producto.Categoria.Select(x => x.Nombre).FirstOrDefault(),
                Etiqueta = c.Inventario.Nombre,
                c.Stock,
            })
            .ToListAsync();

        var items = filas.Select(f =>
        {
            var extra = BienJson.Leer<ProductoExtra>(f.Caracteristicas);
            return new InventarioItem
            {
                VarianteId = f.InventarioId,
                ProductoId = f.ProductoId,
                ProductoNombre = f.ProductoNombre,
                Foto = extra.Fotos.FirstOrDefault(),
                Categoria = f.Categoria ?? "",
                Etiqueta = f.Etiqueta,
                TipoVariante = extra.TipoVariante,
                Sku = extra.Skus.TryGetValue(f.InventarioId.ToString(), out var sku) ? sku : "",
                Stock = f.Stock,
                Activo = f.Activo,
            };
        }).ToList();

        return Ok(items);
    }

    // PATCH /api/variants/{id}/stock      cuerpo: { "stock": 12 }
    // {id} es el id de la variante (inventario.idinventario) que entrega GET /api/me/inventory.
    [HttpPatch("variants/{id:int}/stock")]
    public async Task<IActionResult> ActualizarStock(int id, [FromBody] StockEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        if (datos.Stock == null || datos.Stock < 0 || datos.Stock > MaxStock)
            return Invalido(new Dictionary<string, string[]>
            {
                ["stock"] = new[] { $"El stock debe ser un entero entre 0 y {MaxStock}." },
            });

        var filas = await Db.Contiene
            .Include(c => c.Producto)
            .Include(c => c.Inventario)
            .Where(c => c.InventarioId == id)
            .ToListAsync();

        if (filas.Count == 0) return Problem(detail: "La variante ya no existe.", statusCode: 404);

        var fila = filas.FirstOrDefault(c => c.Producto.EmprendedorId == run);
        if (fila == null)
            return Problem(detail: "No puedes modificar el stock de un producto ajeno.", statusCode: 403);

        fila.Stock = datos.Stock.Value;
        await Db.SaveChangesAsync();

        var categoria = await Db.Producto
            .Where(p => p.Idbien == fila.ProductoId)
            .SelectMany(p => p.Categoria)
            .Select(c => c.Nombre)
            .FirstOrDefaultAsync();

        var extra = BienJson.Leer<ProductoExtra>(fila.Producto.Caracteristicas);
        return Ok(new InventarioItem
        {
            VarianteId = fila.InventarioId,
            ProductoId = fila.ProductoId,
            ProductoNombre = fila.Producto.Nombre,
            Foto = extra.Fotos.FirstOrDefault(),
            Categoria = categoria ?? "",
            Etiqueta = fila.Inventario.Nombre,
            TipoVariante = extra.TipoVariante,
            Sku = extra.Skus.TryGetValue(fila.InventarioId.ToString(), out var sku) ? sku : "",
            Stock = fila.Stock,
            Activo = fila.Producto.Activo,
        });
    }
}
