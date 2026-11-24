using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Mensaje
{
    public int Idmensaje { get; set; }

    public string Contenido { get; set; } = null!;

    public DateTime Fechaenvio { get; set; }

    public bool Leido { get; set; }

    public virtual ICollection<Interactua> Interactua { get; set; } = new List<Interactua>();
}
