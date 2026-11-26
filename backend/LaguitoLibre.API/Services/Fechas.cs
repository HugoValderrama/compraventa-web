using System.Globalization;

namespace LaguitoLibre.API.Services;

public static class Fechas
{
    public const string Formato = "yyyy-MM-dd";

    // "Hoy" en hora de Chile (si el servidor no tiene la zona, usa la hora local).
    public static DateOnly Hoy()
    {
        try
        {
            var chile = TimeZoneInfo.FindSystemTimeZoneById("America/Santiago");
            return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTime.UtcNow, chile));
        }
        catch (TimeZoneNotFoundException)
        {
            return DateOnly.FromDateTime(DateTime.Now);
        }
        catch (InvalidTimeZoneException)
        {
            return DateOnly.FromDateTime(DateTime.Now);
        }
    }

    public static string Texto(DateOnly fecha) =>
        fecha.ToString(Formato, CultureInfo.InvariantCulture);

    // Acepta solo aaaa-mm-dd (año de 4 dígitos), igual que el frontend.
    public static bool TryLeer(string? texto, out DateOnly fecha) =>
        DateOnly.TryParseExact(texto, Formato, CultureInfo.InvariantCulture, DateTimeStyles.None, out fecha);

    public static string EstadoOferta(DateOnly inicio, DateOnly fin, bool activa, DateOnly hoy)
    {
        if (!activa) return "Inactiva";
        if (hoy < inicio) return "Programada";
        if (hoy > fin) return "Finalizada";
        return "Activa";
    }
}
