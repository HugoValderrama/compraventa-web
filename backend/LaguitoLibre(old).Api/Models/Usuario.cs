using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Usuario
{
    public string Run { get; set; } = null!;

    public string Nombre1 { get; set; } = null!;

    public string? Nombre2 { get; set; }

    public string Apellido1 { get; set; } = null!;

    public string? Apellido2 { get; set; }

    public string Clave { get; set; } = null!;

    public DateOnly Fechanac { get; set; }

    public DateOnly Fecharegistro { get; set; }

    public virtual ICollection<Averigua> Averiguas { get; set; } = new List<Averigua>();

    public virtual Cliente? Cliente { get; set; }

    public virtual ICollection<Consultum> Consulta { get; set; } = new List<Consultum>();

    public virtual ICollection<Contestum> Contesta { get; set; } = new List<Contestum>();

    public virtual ICollection<Correo> Correos { get; set; } = new List<Correo>();

    public virtual Emprendedor? Emprendedor { get; set; }

    public virtual ICollection<Evalua> Evaluas { get; set; } = new List<Evalua>();

    public virtual ICollection<Interactua> Interactuas { get; set; } = new List<Interactua>();

    public virtual ICollection<Responde> Respondes { get; set; } = new List<Responde>();

    public virtual ICollection<Telefono> Telefonos { get; set; } = new List<Telefono>();

    public virtual ICollection<Direccion> Direccions { get; set; } = new List<Direccion>();
}
