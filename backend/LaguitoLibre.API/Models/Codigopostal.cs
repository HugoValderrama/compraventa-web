using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Codigopostal
{
    public int Codigopostal1 { get; set; }

    public int ComunaId { get; set; }

    public virtual Comuna Comuna { get; set; } = null!;

    public virtual ICollection<Direccion> Direccion { get; set; } = new List<Direccion>();
}
