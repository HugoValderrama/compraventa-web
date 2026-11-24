using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Pregunta
{
    public int Idpregunta { get; set; }

    public string Pregunta1 { get; set; } = null!;

    public bool Estado { get; set; }

    public DateTime Fecha { get; set; }

    public virtual ICollection<Averigua> Averigua { get; set; } = new List<Averigua>();

    public virtual ICollection<Consulta> Consulta { get; set; } = new List<Consulta>();

    public virtual ICollection<Contesta> Contesta { get; set; } = new List<Contesta>();

    public virtual ICollection<Responde> Responde { get; set; } = new List<Responde>();
}
