using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Preguntum
{
    public int Idpregunta { get; set; }

    public string Pregunta { get; set; } = null!;

    public bool Estado { get; set; }

    public DateTime Fecha { get; set; }

    public virtual ICollection<Averigua> Averiguas { get; set; } = new List<Averigua>();

    public virtual ICollection<Consultum> Consulta { get; set; } = new List<Consultum>();

    public virtual ICollection<Contestum> Contesta { get; set; } = new List<Contestum>();

    public virtual ICollection<Responde> Respondes { get; set; } = new List<Responde>();
}
