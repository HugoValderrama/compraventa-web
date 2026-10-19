using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Rebaja
{
    public int OfertaId { get; set; }

    public int ProductoId { get; set; }

    public int Precio { get; set; }

    public bool Activo { get; set; }

    public virtual Ofertum Oferta { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;
}
