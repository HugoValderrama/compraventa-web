using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Contiene
{
    public int InventarioId { get; set; }

    public int ProductoId { get; set; }

    public int Stock { get; set; }

    public virtual ICollection<Carrito> Carritos { get; set; } = new List<Carrito>();

    public virtual Inventario Inventario { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;
}
