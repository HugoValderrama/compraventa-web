namespace LaguitoLibre.API.DTOs;

// Una fila = una variante de un producto del emprendedor.
public class InventarioItem
{
    public int VarianteId { get; set; }          // = inventario.idinventario
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; } = "";
    public string? Foto { get; set; }
    public string Categoria { get; set; } = "";
    public string Etiqueta { get; set; } = "";
    public string TipoVariante { get; set; } = "";
    public string Sku { get; set; } = "";
    public int Stock { get; set; }
    public bool Activo { get; set; }
}

public class StockEntrada
{
    public int? Stock { get; set; }
}
