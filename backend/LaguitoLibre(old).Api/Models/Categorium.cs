using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Categorium
{
    public int Idcategoria { get; set; }

    public string Nombre { get; set; } = null!;

    public int? CategoriapadreId { get; set; }

    public virtual Categorium? Categoriapadre { get; set; }

    public virtual ICollection<Categorium> InverseCategoriapadre { get; set; } = new List<Categorium>();

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();
}
