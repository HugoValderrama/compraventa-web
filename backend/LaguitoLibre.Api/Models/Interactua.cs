using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Interactua
{
    public string UsuarioId { get; set; } = null!;

    public int MensajeId { get; set; }

    public int VentaId { get; set; }

    public virtual Mensaje Mensaje { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual Ventum Venta { get; set; } = null!;
}
