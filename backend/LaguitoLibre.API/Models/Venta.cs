using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Venta
{
    public int Idventa { get; set; }

    public int Totalsiniva { get; set; }

    public int Iva { get; set; }

    public int Descuento { get; set; }

    public int Totalconiva { get; set; }

    public int MetodopagoId { get; set; }

    public string? Estadopago { get; set; }

    public DateTime? Fechaventa { get; set; }

    public virtual ICollection<Adquiere> Adquiere { get; set; } = new List<Adquiere>();

    public virtual ICollection<Compra> Compra { get; set; } = new List<Compra>();

    public virtual ICollection<Cotizacion> Cotizacion { get; set; } = new List<Cotizacion>();

    public virtual ICollection<Devuelve> Devuelve { get; set; } = new List<Devuelve>();

    public virtual ICollection<Evalua> Evalua { get; set; } = new List<Evalua>();

    public virtual ICollection<Interactua> Interactua { get; set; } = new List<Interactua>();

    public virtual Metodopago Metodopago { get; set; } = null!;

    public virtual ICollection<Produce> Produce { get; set; } = new List<Produce>();

    public virtual ICollection<Despacho> Despacho { get; set; } = new List<Despacho>();
}
