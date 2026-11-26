using System.Text.RegularExpressions;

namespace LaguitoLibre.Api.Common;

public static class RunValidator
{
    public static bool EsValido(string? run)
    {
        // Rechazar valores vacíos
        if (string.IsNullOrWhiteSpace(run))
            return false;

        run = run.Trim().ToUpperInvariant();

        // Validar formato del RUN
        if (!Regex.IsMatch(run, @"^[0-9]{7,8}-[0-9K]$"))
            return false;

        string[] partes = run.Split('-');

        string cuerpo = partes[0];
        char dvIngresado = partes[1][0];

        // Rechazar RUN compuestos por números iguales
        if (cuerpo.All(c => c == cuerpo[0]))
            return false;

        // Calcular módulo 11
        int suma = 0;
        int multiplicador = 2;

        for (int i = cuerpo.Length - 1; i >= 0; i--)
        {
            suma += (cuerpo[i] - '0') * multiplicador;

            multiplicador++;

            if (multiplicador > 7)
                multiplicador = 2;
        }

        int resultado = 11 - (suma % 11);

        char dvCalculado = resultado switch
        {
            11 => '0',
            10 => 'K',
            _ => (char)('0' + resultado)
        };

        return dvIngresado == dvCalculado;
    }
}