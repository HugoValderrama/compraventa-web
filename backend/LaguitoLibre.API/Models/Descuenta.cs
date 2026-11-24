using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Descuenta
{
    public int OfertaId { get; set; }

    public int ServicioId { get; set; }

    public int Precio { get; set; }

    public virtual Oferta Oferta { get; set; } = null!;

    public virtual Servicio Servicio { get; set; } = null!;
}
