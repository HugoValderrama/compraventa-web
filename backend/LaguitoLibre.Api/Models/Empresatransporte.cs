using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Empresatransporte
{
    public string Rut { get; set; } = null!;

    public string Razonsocial { get; set; } = null!;

    public int Telefonocontacto { get; set; }

    public virtual ICollection<Despacho> Despachos { get; set; } = new List<Despacho>();

    public virtual ICollection<Empresa> Empresas { get; set; } = new List<Empresa>();
}
