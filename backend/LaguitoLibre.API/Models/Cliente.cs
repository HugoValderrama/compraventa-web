using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Cliente
{
    public string UsuarioId { get; set; } = null!;

    public decimal? Descuento { get; set; }

    public DateOnly? Fechadescuento { get; set; }

    public virtual ICollection<Adquiere> Adquiere { get; set; } = new List<Adquiere>();

    public virtual ICollection<Carrito> Carrito { get; set; } = new List<Carrito>();

    public virtual ICollection<Compra> Compra { get; set; } = new List<Compra>();

    public virtual ICollection<Cotizacion> Cotizacion { get; set; } = new List<Cotizacion>();

    public virtual ICollection<Devuelve> Devuelve { get; set; } = new List<Devuelve>();

    public virtual ICollection<Produce> Produce { get; set; } = new List<Produce>();

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual ICollection<Producto> Producto { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicio { get; set; } = new List<Servicio>();
}
