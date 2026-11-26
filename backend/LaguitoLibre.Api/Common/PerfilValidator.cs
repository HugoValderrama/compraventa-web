using System.Text.RegularExpressions;
using LaguitoLibre.Api.DTOs.Perfil;

namespace LaguitoLibre.Api.Common;

public static class PerfilValidator
{
    public static List<string> Validar(
        ActualizarPerfilRequest request)
    {
        var errores = new List<string>();

        // Validar primer nombre
        if (!NombreValido(request.Nombre1))
        {
            errores.Add("El primer nombre no es válido.");
        }

        // Validar segundo nombre (opcional)
        if (!string.IsNullOrEmpty(request.Nombre2) &&
            !NombreValido(request.Nombre2))
        {
            errores.Add("El segundo nombre no es válido.");
        }

        // Validar primer apellido
        if (!NombreValido(request.Apellido1))
        {
            errores.Add("El primer apellido no es válido.");
        }

        // Validar segundo apellido (opcional)
        if (!string.IsNullOrEmpty(request.Apellido2) &&
            !NombreValido(request.Apellido2))
        {
            errores.Add("El segundo apellido no es válido.");
        }

        // Validar fecha de nacimiento
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        if (request.FechaNacimiento == default ||
            request.FechaNacimiento > hoy)
        {
            errores.Add(
                "La fecha de nacimiento no es válida."
            );
        }
        else if (request.FechaNacimiento > hoy.AddYears(-18))
        {
            errores.Add(
                "El usuario debe tener al menos 18 años."
            );
        }

        return errores;
    }

    private static bool NombreValido(string? nombre)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            return false;

        if (nombre.Length > 20)
            return false;

        if (nombre != nombre.Trim())
            return false;

        return Regex.IsMatch(
            nombre,
            @"^[\p{L}]+(?:[ '\-][\p{L}]+)*$"
        );
    }
}