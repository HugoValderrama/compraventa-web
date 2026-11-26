using LaguitoLibre.API.Data;
using LaguitoLibre.API.DTOs;
using LaguitoLibre.API.Models;
using LaguitoLibre.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

// "Mis servicios".
//   servicio.activo  <-> estado Activo / Pausado
//   modalidad, precio, cupos, horario, etc. -> columna servicio.caracteristicas (jsonb)
[Route("api")]
public class ServiciosController : EmprendedorControllerBase
{
    private const int MaxNombre = 50;          // servicio.nombre varchar(50)
    private const int MaxDescripcion = 500;    // servicio.descripcion varchar(500)
    private const int MaxTextoCorto = 100;
    private const int MaxTextoLargo = 500;
    private const int MaxFoto = 1_500_000;     // la foto viaja como texto (data URL)

    private const string SinRestriccion = "Ninguna";
    private const string SoloMayores = "Solo mayores de 18 años";

    private static readonly string[] Modalidades = { "Presencial", "Online", "Mixto" };
    private static readonly string[] Unidades = { "persona", "hora", "servicio" };

    public ServiciosController(AppDbContext db) : base(db)
    {
    }

    // GET /api/me/servicios
    [HttpGet("me/servicios")]
    public async Task<IActionResult> MisServicios()
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var servicios = await ConDetalle()
            .AsNoTracking()
            .Where(s => s.EmprendedorId == run)
            .OrderByDescending(s => s.Idbien)
            .ToListAsync();

        var hoy = Fechas.Hoy();
        return Ok(servicios.Select(s => Mapear(s, hoy)).ToList());
    }

    // GET /api/servicios/{id}   (público; un servicio pausado solo lo ve su dueño)
    [AllowAnonymous]
    [HttpGet("servicios/{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var servicio = await ConDetalle()
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Idbien == id);

        if (servicio == null || (!servicio.Activo && servicio.EmprendedorId != RunActual))
            return Problem(detail: "Servicio no encontrado.", statusCode: 404);

        return Ok(Mapear(servicio, Fechas.Hoy()));
    }

    // POST /api/servicios
    [HttpPost("servicios")]
    public async Task<IActionResult> Crear([FromBody] ServicioEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var errores = Validar(datos);
        var categoria = await BuscarCategoria(datos.Categoria);
        if (categoria == null && !errores.ContainsKey("categoria"))
            errores["categoria"] = new[] { "La categoría no existe." };
        if (errores.Count > 0) return Invalido(errores);

        var servicio = new Servicio
        {
            Nombre = datos.Nombre!.Trim(),
            Descripcion = datos.Descripcion!.Trim(),
            Restriccionedad = datos.RestriccionEdad == SoloMayores,
            EmprendedorId = run,
            Fechainicio = Fechas.Hoy(),
            Fechafin = null,
            Caracteristicas = BienJson.Escribir(ConstruirExtra(datos)),
            Activo = true,
        };
        servicio.Categoria.Add(categoria!);

        Db.Servicio.Add(servicio);
        await Db.SaveChangesAsync();

        return CreatedAtAction(nameof(Obtener), new { id = servicio.Idbien }, Mapear(servicio, Fechas.Hoy()));
    }

    // PUT /api/servicios/{id}   (no cambia el estado; para eso está PATCH .../estado)
    [HttpPut("servicios/{id:int}")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] ServicioEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var servicio = await ConDetalle().FirstOrDefaultAsync(s => s.Idbien == id);
        if (servicio == null) return Problem(detail: "Servicio no encontrado.", statusCode: 404);
        if (servicio.EmprendedorId != run) return Forbid();

        var hoy = Fechas.Hoy();
        var errores = Validar(datos);
        var categoria = await BuscarCategoria(datos.Categoria);
        if (categoria == null && !errores.ContainsKey("categoria"))
            errores["categoria"] = new[] { "La categoría no existe." };

        if (servicio.Descuenta.Any(d => d.Oferta.Fechafin >= hoy && d.Precio >= datos.Precio))
            errores["precio"] = new[] { "El precio debe ser mayor que el de la oferta vigente o programada." };

        if (errores.Count > 0) return Invalido(errores);

        servicio.Nombre = datos.Nombre!.Trim();
        servicio.Descripcion = datos.Descripcion!.Trim();
        servicio.Restriccionedad = datos.RestriccionEdad == SoloMayores;
        servicio.Caracteristicas = BienJson.Escribir(ConstruirExtra(datos));

        if (!servicio.Categoria.Any(c => c.Idcategoria == categoria!.Idcategoria))
        {
            servicio.Categoria.Clear();
            servicio.Categoria.Add(categoria!);
        }

        await Db.SaveChangesAsync();
        return Ok(Mapear(servicio, hoy));
    }

    // PATCH /api/servicios/{id}/estado     cuerpo: { "estado": "Activo" | "Pausado" }
    [HttpPatch("servicios/{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] EstadoServicioEntrada datos)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        if (datos.Estado != "Activo" && datos.Estado != "Pausado")
            return Invalido(new Dictionary<string, string[]> { ["estado"] = new[] { "El estado debe ser Activo o Pausado." } });

        var servicio = await ConDetalle().FirstOrDefaultAsync(s => s.Idbien == id);
        if (servicio == null) return Problem(detail: "Servicio no encontrado.", statusCode: 404);
        if (servicio.EmprendedorId != run) return Forbid();

        servicio.Activo = datos.Estado == "Activo";
        await Db.SaveChangesAsync();
        return Ok(Mapear(servicio, Fechas.Hoy()));
    }

    // DELETE /api/servicios/{id}
    [HttpDelete("servicios/{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var (run, error) = await ExigirEmprendedor();
        if (error != null) return error;

        var servicio = await Db.Servicio
            .Include(s => s.Descuenta)
            .Include(s => s.Averigua)
            .Include(s => s.Categoria)
            .Include(s => s.Cliente)
            .Include(s => s.Cotizacion)
            .AsSplitQuery()
            .FirstOrDefaultAsync(s => s.Idbien == id);

        if (servicio == null) return Problem(detail: "Servicio no encontrado.", statusCode: 404);
        if (servicio.EmprendedorId != run) return Forbid();

        var tieneHistorial =
            await Db.Adquiere.AnyAsync(a => a.ServicioId == id) ||
            await Db.Evalua.AnyAsync(e => e.ServicioId == id);

        if (tieneHistorial)
            return Problem(
                detail: "El servicio tiene contrataciones o evaluaciones asociadas. Páusalo en lugar de eliminarlo.",
                statusCode: 409);

        await using var tx = await Db.Database.BeginTransactionAsync();

        var idsOferta = servicio.Descuenta.Select(d => d.OfertaId).ToList();

        Db.Descuenta.RemoveRange(servicio.Descuenta);
        Db.Averigua.RemoveRange(servicio.Averigua);
        servicio.Categoria.Clear();
        servicio.Cliente.Clear();
        servicio.Cotizacion.Clear();
        Db.Servicio.Remove(servicio);
        await Db.SaveChangesAsync();

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

    private IQueryable<Servicio> ConDetalle() =>
        Db.Servicio
            .Include(s => s.Categoria)
            .Include(s => s.Descuenta).ThenInclude(d => d.Oferta)
            .AsSplitQuery();

    private async Task<Categoria?> BuscarCategoria(string? nombre)
    {
        var buscado = nombre?.Trim().ToLower();
        if (string.IsNullOrEmpty(buscado)) return null;
        return await Db.Categoria.FirstOrDefaultAsync(c => c.Nombre.ToLower() == buscado);
    }

    private static ServicioExtra ConstruirExtra(ServicioEntrada d) => new()
    {
        Modalidad = d.Modalidad!.Trim(),
        Ubicacion = d.Ubicacion!.Trim(),
        Duracion = d.Duracion!.Trim(),
        Cupos = d.Cupos,
        Precio = d.Precio,
        UnidadCobro = d.UnidadCobro!.Trim(),
        DiasHorario = d.DiasHorario!.Trim(),
        ProximaFecha = string.IsNullOrWhiteSpace(d.ProximaFecha) ? null : d.ProximaFecha.Trim(),
        PermiteCotizacion = d.PermiteCotizacion,
        Foto = string.IsNullOrWhiteSpace(d.Foto) ? null : d.Foto,
        Condiciones = d.Condiciones!.Trim(),
        Incluye = string.IsNullOrWhiteSpace(d.Incluye) ? null : d.Incluye.Trim(),
    };

    private static ServicioSalida Mapear(Servicio s, DateOnly hoy)
    {
        var extra = BienJson.Leer<ServicioExtra>(s.Caracteristicas);

        var oferta = s.Descuenta
            .Where(d => d.Oferta.Fechafin >= hoy)
            .OrderBy(d => d.Oferta.Fechainicio)
            .FirstOrDefault();

        return new ServicioSalida
        {
            Id = s.Idbien,
            EmprendedorId = s.EmprendedorId,
            Nombre = s.Nombre,
            Categoria = s.Categoria.Select(c => c.Nombre).FirstOrDefault() ?? "",
            Descripcion = s.Descripcion ?? "",
            Modalidad = extra.Modalidad,
            Ubicacion = extra.Ubicacion,
            Duracion = extra.Duracion,
            Cupos = extra.Cupos,
            Precio = extra.Precio,
            UnidadCobro = extra.UnidadCobro,
            Estado = s.Activo ? "Activo" : "Pausado",
            RestriccionEdad = s.Restriccionedad == true ? SoloMayores : SinRestriccion,
            DiasHorario = extra.DiasHorario,
            ProximaFecha = extra.ProximaFecha ?? "",
            PermiteCotizacion = extra.PermiteCotizacion,
            Foto = extra.Foto ?? "",
            Condiciones = extra.Condiciones,
            Incluye = extra.Incluye ?? "",
            Oferta = oferta == null
                ? null
                : new OfertaResumen
                {
                    FechaInicio = Fechas.Texto(oferta.Oferta.Fechainicio),
                    FechaFin = Fechas.Texto(oferta.Oferta.Fechafin),
                    PrecioOferta = oferta.Precio,
                    EstadoOferta = Fechas.EstadoOferta(oferta.Oferta.Fechainicio, oferta.Oferta.Fechafin, true, hoy),
                },
        };
    }

    // Mismas reglas de pages/Servicios/ServicioForm.jsx. Ojo: el frontend permite
    // nombres de 80 caracteres, pero servicio.nombre en la base es varchar(50).
    private static Dictionary<string, string[]> Validar(ServicioEntrada d)
    {
        var e = new Dictionary<string, string[]>();
        void Err(string campo, string mensaje) => e[campo] = new[] { mensaje };

        var nombre = d.Nombre?.Trim() ?? "";
        if (nombre.Length == 0) Err("nombre", "El nombre es obligatorio.");
        else if (nombre.Length > MaxNombre) Err("nombre", $"El nombre puede tener hasta {MaxNombre} caracteres.");

        if (string.IsNullOrWhiteSpace(d.Categoria)) Err("categoria", "Elige una categoría.");

        if (!Modalidades.Contains(d.Modalidad ?? ""))
            Err("modalidad", "Elige una modalidad: Presencial, Online o Mixto.");

        var descripcion = d.Descripcion?.Trim() ?? "";
        if (descripcion.Length == 0) Err("descripcion", "La descripción y el alcance son obligatorios.");
        else if (descripcion.Length > MaxDescripcion)
            Err("descripcion", $"La descripción puede tener hasta {MaxDescripcion} caracteres.");

        if (d.Precio < 1) Err("precio", "El precio debe ser un número entero mayor que cero.");

        if (!Unidades.Contains(d.UnidadCobro ?? ""))
            Err("unidadCobro", "Elige una unidad de cobro: persona, hora o servicio.");

        var condiciones = d.Condiciones?.Trim() ?? "";
        if (condiciones.Length == 0) Err("condiciones", "Indica las condiciones y la cancelación.");
        else if (condiciones.Length > MaxTextoLargo)
            Err("condiciones", $"Las condiciones pueden tener hasta {MaxTextoLargo} caracteres.");

        var ubicacion = d.Ubicacion?.Trim() ?? "";
        if (ubicacion.Length == 0) Err("ubicacion", "El lugar de atención es obligatorio.");
        else if (ubicacion.Length > MaxTextoCorto)
            Err("ubicacion", $"El lugar puede tener hasta {MaxTextoCorto} caracteres.");

        var duracion = d.Duracion?.Trim() ?? "";
        if (duracion.Length == 0) Err("duracion", "La duración es obligatoria.");
        else if (duracion.Length > MaxTextoCorto)
            Err("duracion", $"La duración puede tener hasta {MaxTextoCorto} caracteres.");

        if (d.Cupos < 1) Err("cupos", "Los cupos deben ser un número entero mayor que cero.");

        var horario = d.DiasHorario?.Trim() ?? "";
        if (horario.Length == 0) Err("diasHorario", "Indica los días y el horario.");
        else if (horario.Length > MaxTextoCorto)
            Err("diasHorario", $"Los días y horario pueden tener hasta {MaxTextoCorto} caracteres.");

        if (!string.IsNullOrWhiteSpace(d.ProximaFecha) && !Fechas.TryLeer(d.ProximaFecha.Trim(), out _))
            Err("proximaFecha", "Elige una fecha válida (aaaa-mm-dd).");

        if (d.RestriccionEdad != SinRestriccion && d.RestriccionEdad != SoloMayores)
            Err("restriccionEdad", "Elige una restricción de edad.");

        if ((d.Incluye?.Length ?? 0) > MaxTextoLargo)
            Err("incluye", $"Lo que incluye puede tener hasta {MaxTextoLargo} caracteres.");

        if ((d.Foto?.Length ?? 0) > MaxFoto) Err("foto", "La foto es demasiado grande.");

        return e;
    }
}
