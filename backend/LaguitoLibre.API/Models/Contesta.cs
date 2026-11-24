using System;
using System.Collections.Generic;

namespace LaguitoLibre.API.Models;

public partial class Contesta
{
    public string UsuarioId { get; set; } = null!;

    public int RespuestaId { get; set; }

    public int PreguntaId { get; set; }

    public virtual Pregunta Pregunta { get; set; } = null!;

    public virtual Respuesta Respuesta { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
