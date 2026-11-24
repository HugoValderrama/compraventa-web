using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Ofertum
{
    public int Idoferta { get; set; }

    public DateOnly Fechainicio { get; set; }

    public DateOnly Fechafin { get; set; }

    public virtual ICollection<Descuentum> Descuenta { get; set; } = new List<Descuentum>();

    public virtual ICollection<Rebaja> Rebajas { get; set; } = new List<Rebaja>();
}
