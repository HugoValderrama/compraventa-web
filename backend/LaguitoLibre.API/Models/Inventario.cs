using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Inventario
{
    public int Idinventario { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Contiene> Contiene { get; set; } = new List<Contiene>();
}
