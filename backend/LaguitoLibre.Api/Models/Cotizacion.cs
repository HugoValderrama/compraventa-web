using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Cotizacion
{
    public int Idcotizacion { get; set; }

    public DateOnly Validez { get; set; }

    public string Estado { get; set; } = null!;

    public int? VentaId { get; set; }

    public string ClienteId { get; set; } = null!;

    public DateOnly Fecha { get; set; }

    public int Precio { get; set; }

    public DateOnly? FechaUltimoAjuste { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Ventum? Venta { get; set; }

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();
}
