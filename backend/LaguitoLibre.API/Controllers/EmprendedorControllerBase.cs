using System.Security.Claims;
using LaguitoLibre.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LaguitoLibre.API.Controllers;

// Base de los controladores del emprendedor: exige JWT y resuelve "quién soy"
// desde el token (nunca desde el cuerpo de la petición).
[ApiController]
[Authorize]
public abstract class EmprendedorControllerBase : ControllerBase
{
    protected readonly AppDbContext Db;

    protected EmprendedorControllerBase(AppDbContext db)
    {
        Db = db;
    }

    // RUN del usuario autenticado (claim NameIdentifier, o "sub" si el token lo trae así).
    protected string? RunActual =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    // Devuelve el RUN si el usuario del token existe como emprendedor.
    // Si no, Error trae el resultado listo para retornar (401 o 403).
    protected async Task<(string Run, IActionResult? Error)> ExigirEmprendedor()
    {
        var run = RunActual;
        if (string.IsNullOrEmpty(run))
            return ("", Unauthorized());

        var esEmprendedor = await Db.Emprendedor.AnyAsync(e => e.UsuarioId == run);
        if (!esEmprendedor)
            return ("", Problem(detail: "Solo un emprendedor puede usar este recurso.", statusCode: 403));

        return (run, null);
    }

    // 400 con { errors: { campo: ["mensaje"] } } (formato estándar de ASP.NET Core).
    protected IActionResult Invalido(Dictionary<string, string[]> errores) =>
        ValidationProblem(new ValidationProblemDetails(errores));
}
