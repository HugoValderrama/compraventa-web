using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Codigopostal
{
    public int Codigopostal1 { get; set; }

    public int ComunaId { get; set; }

    public virtual Comuna Comuna { get; set; } = null!;

    public virtual ICollection<Direccion> Direccions { get; set; } = new List<Direccion>();
}
