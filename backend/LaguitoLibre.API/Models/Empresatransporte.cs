using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Empresatransporte
{
    public string Rut { get; set; } = null!;

    public string Razonsocial { get; set; } = null!;

    public int Telefonocontacto { get; set; }

    public virtual ICollection<Despacho> Despacho { get; set; } = new List<Despacho>();

    public virtual ICollection<Empresa> Empresa { get; set; } = new List<Empresa>();
}
