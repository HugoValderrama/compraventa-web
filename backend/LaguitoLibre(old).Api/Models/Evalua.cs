using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Evalua
{
    public string UsuarioId { get; set; } = null!;

    public int CalificacionId { get; set; }

    public int VentaId { get; set; }

    public int ServicioId { get; set; }

    public virtual Calificacion Calificacion { get; set; } = null!;

    public virtual Servicio Servicio { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual Ventum Venta { get; set; } = null!;
}
