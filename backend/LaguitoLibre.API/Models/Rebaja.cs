using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Rebaja
{
    public int OfertaId { get; set; }

    public int ProductoId { get; set; }

    public int Precio { get; set; }

    public bool Activo { get; set; }

    public virtual Oferta Oferta { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;
}
