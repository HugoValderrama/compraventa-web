using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Direccion
{
    public int Iddireccion { get; set; }

    public string Calle { get; set; } = null!;

    public int Numero { get; set; }

    public string? Departamento { get; set; }

    public int Codigopostal { get; set; }

    public virtual Codigopostal CodigopostalNavigation { get; set; } = null!;

    public virtual ICollection<Despacho> Despachos { get; set; } = new List<Despacho>();

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
