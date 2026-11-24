using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Mensaje
{
    public int Idmensaje { get; set; }

    public string Contenido { get; set; } = null!;

    public DateTime Fechaenvio { get; set; }

    public bool Leido { get; set; }

    public virtual ICollection<Interactua> Interactuas { get; set; } = new List<Interactua>();
}
