using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Emprendedor
{
    public string UsuarioId { get; set; } = null!;

    public string? Paginaweb { get; set; }

    public string? EmpresaId { get; set; }

    public virtual Empresa? Empresa { get; set; }

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();

    public virtual Usuario Usuario { get; set; } = null!;
}
