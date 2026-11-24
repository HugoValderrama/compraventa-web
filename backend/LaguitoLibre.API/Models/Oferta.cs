using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Oferta
{
    public int Idoferta { get; set; }

    public DateOnly Fechainicio { get; set; }

    public DateOnly Fechafin { get; set; }

    public virtual ICollection<Descuenta> Descuenta { get; set; } = new List<Descuenta>();

    public virtual ICollection<Rebaja> Rebaja { get; set; } = new List<Rebaja>();
}
