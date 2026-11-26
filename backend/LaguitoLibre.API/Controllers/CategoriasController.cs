using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/categories")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriasController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/categories
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var categorias = await _db.Categoria
            .AsNoTracking()
            .OrderBy(c => c.Nombre)
            .Select(c => new { id = c.Idcategoria, nombre = c.Nombre, categoriaPadreId = c.CategoriapadreId })
            .ToListAsync();

        return Ok(categorias);
    }
}
