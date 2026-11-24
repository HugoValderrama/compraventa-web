using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Categoria
{
    public int Idcategoria { get; set; }

    public string Nombre { get; set; } = null!;

    public int? CategoriapadreId { get; set; }

    public virtual Categoria? Categoriapadre { get; set; }

    public virtual ICollection<Categoria> InverseCategoriapadre { get; set; } = new List<Categoria>();

    public virtual ICollection<Producto> Producto { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicio { get; set; } = new List<Servicio>();
}
