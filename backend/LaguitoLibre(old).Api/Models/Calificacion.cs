using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Calificacion
{
    public int Idcalificacion { get; set; }

    public string? Comentario { get; set; }

    public int Puntuacion { get; set; }

    public virtual ICollection<Evalua> Evaluas { get; set; } = new List<Evalua>();

    public virtual ICollection<Produce> Produces { get; set; } = new List<Produce>();
}
