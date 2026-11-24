using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Comuna
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public int Superficie { get; set; }

    public int IdProvincia { get; set; }

    public virtual ICollection<Codigopostal> Codigopostal { get; set; } = new List<Codigopostal>();

    public virtual Provincia IdProvinciaNavigation { get; set; } = null!;
}
