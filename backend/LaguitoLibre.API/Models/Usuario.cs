using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

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

    public virtual Administrador? Administrador { get; set; }

    public virtual ICollection<Averigua> Averigua { get; set; } = new List<Averigua>();

    public virtual Cliente? Cliente { get; set; }

    public virtual ICollection<Consulta> Consulta { get; set; } = new List<Consulta>();

    public virtual ICollection<Contesta> Contesta { get; set; } = new List<Contesta>();

    public virtual ICollection<Correo> Correo { get; set; } = new List<Correo>();

    public virtual Emprendedor? Emprendedor { get; set; }

    public virtual ICollection<Evalua> Evalua { get; set; } = new List<Evalua>();

    public virtual ICollection<Interactua> Interactua { get; set; } = new List<Interactua>();

    public virtual ICollection<Responde> Responde { get; set; } = new List<Responde>();

    public virtual ICollection<Telefono> Telefono { get; set; } = new List<Telefono>();

    public virtual ICollection<Direccion> Direccion { get; set; } = new List<Direccion>();
}
