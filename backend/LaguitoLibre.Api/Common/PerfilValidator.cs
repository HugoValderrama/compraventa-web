using System.Text.RegularExpressions;
using LaguitoLibre.Api.DTOs.Perfil;
using System.Net.Mail;
using System.Text;

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
    public static string NormalizarTelefono(string? telefono)
{
    if (string.IsNullOrWhiteSpace(telefono))
        return "";

    string limpio = Regex.Replace(telefono, @"[\s-]", "");

    if (Regex.IsMatch(limpio, @"^9[0-9]{8}$"))
    {
        limpio = "+56" + limpio;
    }

    return limpio;
}
public static List<string> ValidarTelefonos(
    ActualizarTelefonosRequest request)
{
    var errores = new List<string>();

    // Mantener al menos un teléfono
    if (request.Telefonos == null ||
        request.Telefonos.Count == 0)
    {
        errores.Add("Debes mantener al menos un teléfono.");
        return errores;
    }

    var telefonosRegistrados = new HashSet<string>();

    foreach (var telefono in request.Telefonos)
    {
        string normalizado = NormalizarTelefono(telefono);

        // Validar formato chileno
        if (!Regex.IsMatch(normalizado, @"^\+569[0-9]{8}$"))
        {
            errores.Add(
                "Ingresa un teléfono chileno válido (+56 9XXXXXXXX)."
            );

            continue;
        }

        // Validar teléfonos duplicados
        if (!telefonosRegistrados.Add(normalizado))
        {
            errores.Add(
                "No puedes ingresar teléfonos duplicados."
            );
        }
    }

    return errores;
}
public static string NormalizarCorreo(string? correo)
{
    if (string.IsNullOrWhiteSpace(correo))
    {
        return "";
    }

    return correo.Trim().ToLowerInvariant();
}
public static List<string> ValidarCorreos(
    ActualizarCorreosRequest request)
{
    var errores = new List<string>();

    // Comprobar que exista al menos un correo
    if (request.Correos == null || request.Correos.Count == 0)
    {
        errores.Add("Debes mantener al menos un correo.");
        return errores;
    }

    var correosRegistrados = new HashSet<string>();

    foreach (var correo in request.Correos)
    {
        string normalizado = NormalizarCorreo(correo);

        // Validar formato y longitud
        if (string.IsNullOrWhiteSpace(normalizado) ||
            normalizado.Length > 50 ||
            !MailAddress.TryCreate(normalizado, out var direccion) ||
            direccion.Address != normalizado)
        {
            errores.Add("Ingresa un correo electrónico válido.");
            continue;
        }

        // Comprobar correos duplicados
        if (!correosRegistrados.Add(normalizado))
        {
            errores.Add("No puedes ingresar correos duplicados.");
        }
    }

    return errores;
}
public static List<string> ValidarCambioClave(CambiarClaveRequest request)
{
    var errores = new List<string>();

    // Validar contraseña actual
    if (string.IsNullOrWhiteSpace(request.Actual))
        errores.Add("Ingresa tu contraseña actual.");

    // Validar nueva contraseña
    if (string.IsNullOrWhiteSpace(request.Nueva))
    {
        errores.Add("Ingresa tu nueva contraseña.");
    }
    else
    {
        if (request.Nueva.Length < 8)
            errores.Add("La contraseña debe tener al menos 8 caracteres.");

        if (!Regex.IsMatch(request.Nueva, @"[a-zA-Z]"))
            errores.Add("La contraseña debe contener al menos una letra.");

        if (!Regex.IsMatch(request.Nueva, @"[0-9]"))
            errores.Add("La contraseña debe contener al menos un número.");

        if (Encoding.UTF8.GetByteCount(request.Nueva) > 72)
            errores.Add("La contraseña no puede superar los 72 bytes.");

        if (request.Nueva == request.Actual)
            errores.Add("La nueva contraseña debe ser distinta de la actual.");
    }

    // Validar confirmación
    if (string.IsNullOrWhiteSpace(request.Confirmacion))
        errores.Add("Confirma tu nueva contraseña.");
    else if (request.Confirmacion != request.Nueva)
        errores.Add("Las contraseñas no coinciden.");

    return errores;
}
public static string NormalizarRutEmpresa(string? rut)
{
    return (rut ?? "")
        .Trim()
        .Replace(".", "")
        .ToUpperInvariant();
}

public static List<string> ValidarRegistroEmpresa(
    RegistrarEmpresaRequest request)
{
    var errores = new List<string>();

    string rut = NormalizarRutEmpresa(request.Rut);
    string razonSocial = (request.RazonSocial ?? "").Trim();
    string giro = (request.Giro ?? "").Trim();
    string paginaWeb = (request.PaginaWeb ?? "").Trim();
    string direccionLocal = (request.DireccionLocal ?? "").Trim();

    // Validar RUT
    if (!RunValidator.EsValido(rut))
    {
        errores.Add("El RUT de la empresa no es válido.");
    }

    // Validar razón social
    if (string.IsNullOrWhiteSpace(razonSocial))
    {
        errores.Add("La razón social es obligatoria.");
    }
    else if (razonSocial.Length > 50)
    {
        errores.Add("La razón social no puede superar los 50 caracteres.");
    }

    // Validar giro
    if (string.IsNullOrWhiteSpace(giro))
    {
        errores.Add("El giro es obligatorio.");
    }
    else if (giro.Length > 50)
    {
        errores.Add("El giro no puede superar los 50 caracteres.");
    }

    // Validar página web (opcional)
    if (!string.IsNullOrEmpty(paginaWeb))
    {
        if (paginaWeb.Length > 30)
        {
            errores.Add("La página web no puede superar los 30 caracteres.");
        }
        else if (!Regex.IsMatch(
            paginaWeb,
            @"^(https?://)?([\p{L}\d-]+\.)+[\p{L}]{2,}(/\S*)?$"))
        {
            errores.Add("Ingresa una página web válida.");
        }
    }

    // Validar dirección del local (opcional)
    if (direccionLocal.Length > 30)
    {
        errores.Add("La dirección del local no puede superar los 30 caracteres.");
    }

    return errores;
}
public static List<string> ValidarActualizacionEmpresa(
    ActualizarEmpresaRequest request)
{
    return ValidarRegistroEmpresa(new RegistrarEmpresaRequest
    {
        Rut = request.Rut,
        RazonSocial = request.RazonSocial,
        Giro = request.Giro,
        PaginaWeb = request.PaginaWeb,
        DireccionLocal = request.DireccionLocal
    });
}
}