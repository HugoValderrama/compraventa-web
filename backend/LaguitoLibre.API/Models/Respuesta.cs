using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Respuesta
{
    public int Idrespuesta { get; set; }

    public string Respuesta1 { get; set; } = null!;

    public bool Estado { get; set; }

    public DateTime Fecha { get; set; }

    public virtual ICollection<Contesta> Contesta { get; set; } = new List<Contesta>();

    public virtual ICollection<Responde> Responde { get; set; } = new List<Responde>();
}
