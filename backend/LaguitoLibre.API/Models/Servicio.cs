using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Servicio
{
    public int Idbien { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public bool? Restriccionedad { get; set; }

    public string EmprendedorId { get; set; } = null!;

    public DateOnly Fechainicio { get; set; }

    public DateOnly? Fechafin { get; set; }

    public string Caracteristicas { get; set; } = null!;

    public bool Activo { get; set; }

    public virtual ICollection<Adquiere> Adquiere { get; set; } = new List<Adquiere>();

    public virtual ICollection<Averigua> Averigua { get; set; } = new List<Averigua>();

    public virtual ICollection<Descuenta> Descuenta { get; set; } = new List<Descuenta>();

    public virtual Emprendedor Emprendedor { get; set; } = null!;

    public virtual ICollection<Evalua> Evalua { get; set; } = new List<Evalua>();

    public virtual ICollection<Categoria> Categoria { get; set; } = new List<Categoria>();

    public virtual ICollection<Cliente> Cliente { get; set; } = new List<Cliente>();

    public virtual ICollection<Cotizacion> Cotizacion { get; set; } = new List<Cotizacion>();
}
