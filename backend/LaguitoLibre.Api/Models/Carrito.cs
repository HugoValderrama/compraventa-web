using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Carrito
{
    public int Iditem { get; set; }

    public string ClienteId { get; set; } = null!;

    public int ProductoId { get; set; }

    public int InventarioId { get; set; }

    public int Cantidad { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Contiene Contiene { get; set; } = null!;
}
