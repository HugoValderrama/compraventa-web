using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Empresa
{
    public string Rut { get; set; } = null!;

    public string Razonsocial { get; set; } = null!;

    public string Giro { get; set; } = null!;

    public string? Paginaweb { get; set; }

    public string? Direccionlocal { get; set; }

    public virtual ICollection<Emprendedor> Emprendedors { get; set; } = new List<Emprendedor>();

    public virtual ICollection<Empresatransporte> Empresatransportes { get; set; } = new List<Empresatransporte>();
}
