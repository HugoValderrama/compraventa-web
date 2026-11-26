using System.Text.Json;

namespace LaguitoLibre.API.Services;

// Las tablas producto y servicio NO tienen columnas para precio, fotos, envío, etc.
// Esos datos se guardan en su columna "caracteristicas" (jsonb) con estas formas.
// Así no hace falta tocar la base de datos ni crear migraciones.

public class EnvioExtra
{
    public bool RetiroEnTaller { get; set; }
    public bool Despacho { get; set; } = true;
    public int CostoEnvio { get; set; }
    public int DiasPreparacion { get; set; } = 1;
}

public class ProductoExtra
{
    public int Precio { get; set; }
    public string TipoVariante { get; set; } = "Tamaño";
    public List<string> Fotos { get; set; } = new();
    public Dictionary<string, string> Caracteristicas { get; set; } = new();
    public EnvioExtra Envio { get; set; } = new();

    // SKU por variante: la clave es el id de inventario (variante) como texto.
    public Dictionary<string, string> Skus { get; set; } = new();
}

public class ServicioExtra
{
    public string Modalidad { get; set; } = "";
    public string Ubicacion { get; set; } = "";
    public string Duracion { get; set; } = "";
    public int Cupos { get; set; }
    public int Precio { get; set; }
    public string UnidadCobro { get; set; } = "";
    public string DiasHorario { get; set; } = "";
    public string? ProximaFecha { get; set; }
    public bool PermiteCotizacion { get; set; }
    public string? Foto { get; set; }
    public string Condiciones { get; set; } = "";
    public string? Incluye { get; set; }
}

public static class BienJson
{
    private static readonly JsonSerializerOptions Opciones = new(JsonSerializerDefaults.Web);

    // Si la columna está vacía o tiene otro formato, devuelve valores por defecto.
    public static T Leer<T>(string? json) where T : new()
    {
        if (string.IsNullOrWhiteSpace(json)) return new T();
        try
        {
            return JsonSerializer.Deserialize<T>(json, Opciones) ?? new T();
        }
        catch (JsonException)
        {
            return new T();
        }
    }

    public static string Escribir<T>(T valor) => JsonSerializer.Serialize(valor, Opciones);
}
