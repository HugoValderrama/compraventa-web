using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Descuentum
{
    public int OfertaId { get; set; }

    public int ServicioId { get; set; }

    public int Precio { get; set; }

    public virtual Ofertum Oferta { get; set; } = null!;

    public virtual Servicio Servicio { get; set; } = null!;
}
