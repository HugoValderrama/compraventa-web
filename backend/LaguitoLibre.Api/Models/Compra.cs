using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Compra
{
    public int VentaId { get; set; }

    public int ProductoId { get; set; }

    public string ClienteId { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public int Cantidad { get; set; }

    public string? Nota { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;

    public virtual Ventum Venta { get; set; } = null!;
}
