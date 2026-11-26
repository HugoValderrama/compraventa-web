using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UbicacionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public UbicacionesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/ubicaciones/regiones
    [HttpGet("regiones")]
    public async Task<IActionResult> GetRegiones()
    {
        var regiones = await _context.Region
            .OrderBy(r => r.Id)
            .Select(r => new
            {
                id = r.Id,
                nombre = r.Nombre
            })
            .ToListAsync();

        return Ok(regiones);
    }

    // GET: api/ubicaciones/regiones/{regionId}/provincias
    [HttpGet("regiones/{regionId:int}/provincias")]
    public async Task<IActionResult> GetProvinciasPorRegion(int regionId)
    {
        var provincias = await _context.Provincia
            .Where(p => p.IdRegion == regionId)
            .OrderBy(p => p.Nombre)
            .Select(p => new
            {
                id = p.Id,
                nombre = p.Nombre
            })
            .ToListAsync();

        return Ok(provincias);
    }

    // GET: api/ubicaciones/provincias/{provinciaId}/comunas
    [HttpGet("provincias/{provinciaId:int}/comunas")]
    public async Task<IActionResult> GetComunasPorProvincia(int provinciaId)
    {
        var comunas = await _context.Comuna
            .Where(c => c.IdProvincia == provinciaId)
            .OrderBy(c => c.Nombre)
            .Select(c => new
            {
                id = c.Id,
                nombre = c.Nombre
            })
            .ToListAsync();

        return Ok(comunas);
    }
}
