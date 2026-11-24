using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaguitoLibre.API.Models
{
	[Table("responde")]
	[PrimaryKey(nameof(usuario_id), nameof(respuesta_id))]
	public class Responde
	{
		public string usuario_id { get; set; }
		[ForeignKey("usuario_id")]
		public Usuario? Usuario { get; set; }
		
		public int respuesta_id { get; set; }
		[ForeignKey("respuesta_id")]
		public Respuesta? Respuesta { get; set; }
		
		public int pregunta_id { get; set; }
		[ForeignKey("pregunta_id")]
		public Pregunta? Pregunta { get; set; }
	}
}
