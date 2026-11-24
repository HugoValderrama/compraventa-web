using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Adquiere
{
    public int VentaId { get; set; }

    public int ServicioId { get; set; }

    public string ClienteId { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Servicio Servicio { get; set; } = null!;

    public virtual Venta Venta { get; set; } = null!;
}
