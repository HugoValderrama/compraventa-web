namespace LaguitoLibre.API.DTOs;

public class ServicioEntrada
{
    public string? Nombre { get; set; }
    public string? Categoria { get; set; }
    public string? Descripcion { get; set; }
    public string? Modalidad { get; set; }       // Presencial | Online | Mixto
    public string? Ubicacion { get; set; }
    public string? Duracion { get; set; }
    public int Cupos { get; set; }
    public int Precio { get; set; }
    public string? UnidadCobro { get; set; }     // persona | hora | servicio
    public string? RestriccionEdad { get; set; } // "Ninguna" | "Solo mayores de 18 años"
    public string? DiasHorario { get; set; }
    public string? ProximaFecha { get; set; }    // aaaa-mm-dd o vacío
    public bool PermiteCotizacion { get; set; }
    public string? Foto { get; set; }
    public string? Condiciones { get; set; }
    public string? Incluye { get; set; }
}

public class ServicioSalida
{
    public int Id { get; set; }
    public string EmprendedorId { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string Categoria { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string Modalidad { get; set; } = "";
    public string Ubicacion { get; set; } = "";
    public string Duracion { get; set; } = "";
    public int Cupos { get; set; }
    public int Precio { get; set; }
    public string UnidadCobro { get; set; } = "";
    public string Estado { get; set; } = "";     // Activo | Pausado
    public string RestriccionEdad { get; set; } = "";
    public string DiasHorario { get; set; } = "";
    public string ProximaFecha { get; set; } = "";
    public bool PermiteCotizacion { get; set; }
    public string Foto { get; set; } = "";
    public string Condiciones { get; set; } = "";
    public string Incluye { get; set; } = "";
    public OfertaResumen? Oferta { get; set; }
}

public class EstadoServicioEntrada
{
    public string? Estado { get; set; }          // Activo | Pausado
}
