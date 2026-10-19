using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

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

    public virtual ICollection<Adquiere> Adquieres { get; set; } = new List<Adquiere>();

    public virtual ICollection<Averigua> Averiguas { get; set; } = new List<Averigua>();

    public virtual ICollection<Descuentum> Descuenta { get; set; } = new List<Descuentum>();

    public virtual Emprendedor Emprendedor { get; set; } = null!;

    public virtual ICollection<Evalua> Evaluas { get; set; } = new List<Evalua>();

    public virtual ICollection<Categorium> Categoria { get; set; } = new List<Categorium>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Cotizacion> Cotizacions { get; set; } = new List<Cotizacion>();
}
