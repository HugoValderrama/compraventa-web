using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Calificacion
{
    public int Idcalificacion { get; set; }

    public string? Comentario { get; set; }

    public int Puntuacion { get; set; }

    public virtual ICollection<Evalua> Evalua { get; set; } = new List<Evalua>();

    public virtual ICollection<Produce> Produce { get; set; } = new List<Produce>();
}
