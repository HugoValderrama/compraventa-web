using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Produce
{
    public string ClienteId { get; set; } = null!;

    public int VentaId { get; set; }

    public int ProductoId { get; set; }

    public int CalificacionId { get; set; }

    public virtual Calificacion Calificacion { get; set; } = null!;

    public virtual Cliente Cliente { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;

    public virtual Venta Venta { get; set; } = null!;
}
