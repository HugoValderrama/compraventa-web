using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Averigua
{
    public string UsuarioId { get; set; } = null!;

    public int PreguntaId { get; set; }

    public int ServicioId { get; set; }

    public virtual Pregunta Pregunta { get; set; } = null!;

    public virtual Servicio Servicio { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
