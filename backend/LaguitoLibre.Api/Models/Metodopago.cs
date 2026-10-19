using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Metodopago
{
    public int Idmetodopago { get; set; }

    public string Nombre { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public int? Ultimosdigitos { get; set; }

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
