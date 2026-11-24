using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Cliente
{
    public string UsuarioId { get; set; } = null!;

    public decimal? Descuento { get; set; }

    public DateOnly? Fechadescuento { get; set; }

    public virtual ICollection<Adquiere> Adquieres { get; set; } = new List<Adquiere>();

    public virtual ICollection<Carrito> Carritos { get; set; } = new List<Carrito>();

    public virtual ICollection<Compra> Compras { get; set; } = new List<Compra>();

    public virtual ICollection<Cotizacion> Cotizacions { get; set; } = new List<Cotizacion>();

    public virtual ICollection<Devuelve> Devuelves { get; set; } = new List<Devuelve>();

    public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();
}
