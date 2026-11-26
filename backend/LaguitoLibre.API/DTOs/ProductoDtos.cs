namespace LaguitoLibre.API.DTOs;

public class EnvioDto
{
    public bool RetiroEnTaller { get; set; }
    public bool Despacho { get; set; } = true;
    public int CostoEnvio { get; set; }
    public int DiasPreparacion { get; set; } = 1;
}

// Entrada: las variantes nuevas pueden venir con un id de texto del frontend ("v1abc");
// solo se reconoce como existente un id numérico que pertenezca al producto.
public class VarianteEntrada
{
    public string? Id { get; set; }
    public string? Etiqueta { get; set; }
    public string? Sku { get; set; }
    public int Stock { get; set; }
}

public class VarianteSalida
{
    public int Id { get; set; }          // = inventario.idinventario
    public string Etiqueta { get; set; } = "";
    public string Sku { get; set; } = "";
    public int Stock { get; set; }
}

public class ProductoEntrada
{
    public string? Nombre { get; set; }
    public string? Descripcion { get; set; }
    public string? Categoria { get; set; }
    public int Precio { get; set; }
    public bool RestriccionEdad { get; set; }
    public bool Activo { get; set; } = true;
    public string? TipoVariante { get; set; }
    public List<VarianteEntrada>? Variantes { get; set; }
    public List<string>? Fotos { get; set; }
    public Dictionary<string, string>? Caracteristicas { get; set; }
    public EnvioDto? Envio { get; set; }
}

public class ProductoSalida
{
    public int Id { get; set; }
    public string EmprendedorId { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string Categoria { get; set; } = "";
    public int Precio { get; set; }
    public string TipoVariante { get; set; } = "";
    public List<VarianteSalida> Variantes { get; set; } = new();
    public List<string> Fotos { get; set; } = new();
    public Dictionary<string, string> Caracteristicas { get; set; } = new();
    public EnvioDto Envio { get; set; } = new();
    public bool RestriccionEdad { get; set; }
    public bool Activo { get; set; }
    public OfertaResumen? Oferta { get; set; }
}
