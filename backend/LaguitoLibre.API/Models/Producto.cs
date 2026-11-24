using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Producto
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

    public virtual ICollection<Compra> Compra { get; set; } = new List<Compra>();

    public virtual ICollection<Consulta> Consulta { get; set; } = new List<Consulta>();

    public virtual ICollection<Contiene> Contiene { get; set; } = new List<Contiene>();

    public virtual ICollection<Devuelve> Devuelve { get; set; } = new List<Devuelve>();

    public virtual Emprendedor Emprendedor { get; set; } = null!;

    public virtual ICollection<Produce> Produce { get; set; } = new List<Produce>();

    public virtual ICollection<Rebaja> Rebaja { get; set; } = new List<Rebaja>();

    public virtual ICollection<Categoria> Categoria { get; set; } = new List<Categoria>();

    public virtual ICollection<Cliente> Cliente { get; set; } = new List<Cliente>();

    public virtual ICollection<Cotizacion> Cotizacion { get; set; } = new List<Cotizacion>();
}
