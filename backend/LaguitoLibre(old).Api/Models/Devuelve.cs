using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Devuelve
{
    public int ProductoId { get; set; }

    public int DevolucionId { get; set; }

    public int VentaId { get; set; }

    public string ClienteId { get; set; } = null!;

    public DateOnly Fecha { get; set; }

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Devolucion Devolucion { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;

    public virtual Ventum Venta { get; set; } = null!;
}
