using System;
using System.Collections.Generic;

namespace LaguitoLibre.Api.Models;

public partial class Contestum
{
    public string UsuarioId { get; set; } = null!;

    public int RespuestaId { get; set; }

    public int PreguntaId { get; set; }

    public virtual Preguntum Pregunta { get; set; } = null!;

    public virtual Respuestum Respuesta { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
