using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Ventum
{
    public int Idventa { get; set; }

    public int Totalsiniva { get; set; }

    public int Iva { get; set; }

    public int Descuento { get; set; }

    public int Totalconiva { get; set; }

    public int MetodopagoId { get; set; }

    public string? Estadopago { get; set; }

    public DateTime? Fechaventa { get; set; }

    public virtual ICollection<Adquiere> Adquieres { get; set; } = new List<Adquiere>();

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();

    public virtual ICollection<Cotizacion> Cotizacions { get; set; } = new List<Cotizacion>();

    public virtual ICollection<Devuelve> Devuelves { get; set; } = new List<Devuelve>();

    public virtual ICollection<Evalua> Evaluas { get; set; } = new List<Evalua>();

    public virtual ICollection<Interactua> Interactuas { get; set; } = new List<Interactua>();

    public virtual Metodopago Metodopago { get; set; } = null!;

    public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();

    public virtual ICollection<Despacho> Despachos { get; set; } = new List<Despacho>();
}
