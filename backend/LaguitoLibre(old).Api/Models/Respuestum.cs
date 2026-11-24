using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Respuestum
{
    public int Idrespuesta { get; set; }

    public string Respuesta { get; set; } = null!;

    public bool Estado { get; set; }

    public DateTime Fecha { get; set; }

    public virtual ICollection<Contestum> Contesta { get; set; } = new List<Contestum>();

    public virtual ICollection<Responde> Respondes { get; set; } = new List<Responde>();
}
