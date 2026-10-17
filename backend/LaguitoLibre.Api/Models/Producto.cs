using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

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

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();

    public virtual ICollection<Consultum> Consulta { get; set; } = new List<Consultum>();

    public virtual ICollection<Contiene> Contienes { get; set; } = new List<Contiene>();

    public virtual ICollection<Devuelve> Devuelves { get; set; } = new List<Devuelve>();

    public virtual Emprendedor Emprendedor { get; set; } = null!;

    public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();

    public virtual ICollection<Rebaja> Rebajas { get; set; } = new List<Rebaja>();

    public virtual ICollection<Categorium> Categoria { get; set; } = new List<Categorium>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Cotizacion> Cotizacions { get; set; } = new List<Cotizacion>();
}
