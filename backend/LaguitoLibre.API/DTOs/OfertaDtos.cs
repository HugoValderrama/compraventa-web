namespace LaguitoLibre.API.DTOs;

// Oferta vigente o próxima, embebida dentro de un producto / servicio.
public class OfertaResumen
{
    public string FechaInicio { get; set; } = "";
    public string FechaFin { get; set; } = "";
    public int PrecioOferta { get; set; }
    public string EstadoOferta { get; set; } = "";
}

public class OfertaEntrada
{
    public string? Tipo { get; set; }            // "producto" (por defecto) | "servicio"
    public int BienId { get; set; }              // id del producto o del servicio
    public string? FechaInicio { get; set; }     // aaaa-mm-dd
    public string? FechaFin { get; set; }        // aaaa-mm-dd
    public int PrecioOferta { get; set; }
}

public class OfertaSalida
{
    public int Id { get; set; }                  // = oferta.idoferta
    public string Tipo { get; set; } = "";
    public int BienId { get; set; }
    public string BienNombre { get; set; } = "";
    public int PrecioNormal { get; set; }
    public int PrecioOferta { get; set; }
    public int DescuentoPorcentaje { get; set; }
    public string FechaInicio { get; set; } = "";
    public string FechaFin { get; set; } = "";
    public string EstadoOferta { get; set; } = ""; // Activa | Programada | Finalizada | Inactiva
}
