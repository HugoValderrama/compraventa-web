using System.Text.RegularExpressions;
using System.Net.Mail;
using LaguitoLibre.Api.DTOs.Auth;

namespace LaguitoLibre.Api.Common;

public static class RegistroValidator
{
    public static List<string> Validar(RegistroRequest request)
    {
        var errores = new List<string>();

        // Validar RUN
        if (!RunValidator.EsValido(request.Run))
            errores.Add("El RUN ingresado no es válido.");

        // Validar primer nombre
        if (!NombreValido(request.Nombre1))
            errores.Add("El primer nombre no es válido.");

        // Validar segundo nombre (opcional)
        if (!string.IsNullOrEmpty(request.Nombre2) &&
            !NombreValido(request.Nombre2))
            errores.Add("El segundo nombre no es válido.");

        // Validar primer apellido
        if (!NombreValido(request.Apellido1))
            errores.Add("El primer apellido no es válido.");

        // Validar segundo apellido (opcional)
        if (!string.IsNullOrEmpty(request.Apellido2) &&
            !NombreValido(request.Apellido2))
            errores.Add("El segundo apellido no es válido.");

        // Validar correo
        if (string.IsNullOrWhiteSpace(request.Correo) ||
            request.Correo.Length > 50 ||
            !MailAddress.TryCreate(request.Correo, out var correo) ||
            correo.Address != request.Correo)
            errores.Add("El correo electrónico no es válido.");

        // Validar teléfono
        if (!Regex.IsMatch(request.Telefono ?? "", @"^[0-9]{8}$"))
            errores.Add("El teléfono debe contener 8 dígitos.");

        // Validar fecha de nacimiento
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        if (request.Fechanac == default ||
            request.Fechanac > hoy)
        {
            errores.Add("La fecha de nacimiento no es válida.");
        }
        else if (request.Fechanac > hoy.AddYears(-18))
        {
            errores.Add("Debes tener al menos 18 años.");
        }

        // Validar contraseña
        if (string.IsNullOrWhiteSpace(request.Clave) ||
            request.Clave.Length < 8 ||
            !request.Clave.Any(char.IsLetter) ||
            !request.Clave.Any(char.IsDigit))
        {
            errores.Add(
                "La contraseña debe contener al menos 8 caracteres, una letra y un número."
            );
        }

        // Validar confirmación de contraseña
        if (request.Clave != request.ConfirmarClave)
            errores.Add("Las contraseñas no coinciden.");

        // Validar rol
        if (request.Rol != "Cliente" &&
            request.Rol != "Emprendedor")
        {
            errores.Add("El rol seleccionado no es válido.");
        }
        if (request.Clave != null &&
    System.Text.Encoding.UTF8.GetByteCount(request.Clave) > 72)
{
    errores.Add("La contraseña supera la longitud máxima permitida.");
}

        // Validar términos y condiciones
        if (!request.AceptaTerminos)
            errores.Add("Debes aceptar los términos y condiciones.");

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