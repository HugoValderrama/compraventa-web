using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Devolucion
{
    public int Iddevolucion { get; set; }

    public string Motivo { get; set; } = null!;

    public bool? Estado { get; set; }

    public int Montoreembolso { get; set; }

    public virtual ICollection<Devuelve> Devuelve { get; set; } = new List<Devuelve>();
}
