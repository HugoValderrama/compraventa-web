using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Inventario
{
    public int Idinventario { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Contiene> Contienes { get; set; } = new List<Contiene>();
}
